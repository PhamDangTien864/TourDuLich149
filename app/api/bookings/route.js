import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { requireAuth } from "@/lib/middleware";
import { 
  SlotReservationService, 
  BookingValidationService, 
  BookingStatus,
  BookingStateMachine,
  PaymentService,
  PaymentType,
  PassengerValidationService
} from "@/lib/booking-service";
import { CacheInvalidator, CACHE_KEYS } from "@/lib/cache";
import { bookingRequestSchema } from "@/lib/validations";
import { successResponse, errorResponse, validationErrorResponse, conflictResponse } from "@/lib/api-response";
import crypto from 'crypto';

export async function POST(req) {
  return requireAuth(async (request) => {
    try {
      console.log('BOOKING API: Request received');
      const user = request.user;
      const accountId = user.id;
      console.log('BOOKING API: User authenticated, accountId:', accountId);
      const body = await req.json();
      console.log('BOOKING API: Request body:', JSON.stringify(body, null, 2));
      
      // Generate or use provided idempotency key using cryptographically secure random
      const idempotencyKey = body.idempotencyKey || `booking_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
      
      // Validate with Zod using centralized validation
      const validationResult = bookingRequestSchema.safeParse(body);
      if (!validationResult.success) {
        console.log('BOOKING API: Zod validation error:', validationResult.error);
        console.log('BOOKING API: Received body:', body);
        const errors = validationResult.error?.errors?.map(e => `${e.path.join('.')}: ${e.message}`) || ['Validation failed'];
        return validationErrorResponse(errors);
      }
      console.log('BOOKING API: Validation passed');

      const validatedData = validationResult.data;
      const { 
        tourId, 
        departureScheduleId,
        amount, 
        customerName, 
        phone, 
        email, 
        startDate, 
        endDate,
        adultsCount,
        childrenCount,
        passengers,
        specialRequests,
        pickupLocation,
        dropoffLocation
      } = validatedData;

      // Check for existing booking with same idempotency key
      console.log('BOOKING API: Checking for existing booking with idempotency key');
      const existingBooking = await prisma.bookings.findFirst({
        where: { 
          idempotency_key: idempotencyKey,
          account_id: accountId
        },
        include: {
          customers: true,
          tours: {
            select: {
              title: true,
              location_name: true
            }
          }
        }
      });
      console.log('BOOKING API: Existing booking check complete');

      if (existingBooking) {
        // Return existing booking
        return successResponse({
          booking: {
            id: existingBooking.id,
            customerName: existingBooking.customers.full_name,
            phone: existingBooking.customers.phone_number,
            email: existingBooking.customers.email,
            tourTitle: existingBooking.tours.title,
            location: existingBooking.tours.location_name,
            amount: Number(existingBooking.total_amount),
            startDate: existingBooking.start_date,
            endDate: existingBooking.end_date,
            status: existingBooking.status
          }
        }, 'Booking đã tồn tại với idempotency key này');
      }

      // Validate booking data
      const validation = BookingValidationService.validateBookingData({
        tourId,
        adultsCount,
        childrenCount,
        startDate,
        endDate
      });

      if (!validation.valid) {
        console.log('Custom validation errors:', validation.errors);
        console.log('Validation data:', { tourId, adultsCount, childrenCount, startDate, endDate });
        return errorResponse("Dữ liệu không hợp lệ", 400, validation.errors);
      }

      // Validate amount
      if (!amount || amount < 100000) {
        return errorResponse("Tổng số tiền phải lớn hơn 100,000 VND", 400);
      }

      // Check for duplicate booking
      const isDuplicate = await BookingValidationService.checkDuplicateBooking(
        tourId,
        accountId,
        new Date(startDate),
        new Date(endDate)
      );

      if (isDuplicate) {
        console.log('Duplicate booking detected for user:', accountId, 'tour:', tourId);
        // Log existing bookings for debugging
        const existingBookings = await prisma.bookings.findMany({
          where: {
            tour_id: tourId,
            account_id: accountId,
            is_deleted: false
          },
          select: {
            id: true,
            status: true,
            start_date: true,
            end_date: true,
            is_deleted: true
          }
        });
        console.log('Existing bookings for this tour:', existingBookings);

        // Check if existing booking is AWAITING_PAYMENT - allow user to continue payment
        const awaitingPaymentBooking = existingBookings.find(b => b.status === 'AWAITING_PAYMENT');
        if (awaitingPaymentBooking) {
          return conflictResponse({
            message: "Bạn đã có booking đang chờ thanh toán cho tour này",
            existingBookingId: awaitingPaymentBooking.id,
            canResume: true
          });
        }

        return conflictResponse("Bạn đã có booking trùng thời gian cho tour này");
      }

      // Wrap entire booking creation in transaction for atomicity
      console.log('BOOKING API: Starting transaction for booking creation');
      const booking = await prisma.$transaction(async (tx) => {
        console.log('BOOKING API: Transaction started');
        const totalPassengers = adultsCount + childrenCount;

        // Reserve slots with transaction
        console.log('BOOKING API: Reserving slots');
        const reservation = await SlotReservationService.reserveSlot(
          tourId,
          departureScheduleId,
          totalPassengers,
          accountId,
          tx
        );
        console.log('BOOKING API: Slot reservation result:', reservation);

        if (!reservation.success) {
          console.log('BOOKING API: Slot reservation failed:', reservation.error);
          throw new Error(reservation.error || "Không thể đặt chỗ");
        }

        // Tạo customer mới hoặc tìm customer existing
        console.log('BOOKING API: Finding/creating customer');
        let customer = await tx.customers.findFirst({
          where: { phone_number: phone, is_deleted: false }
        });
        console.log('BOOKING API: Customer found:', !!customer);

        if (!customer) {
          customer = await tx.customers.create({
            data: {
              full_name: customerName,
              phone_number: phone,
              email: email || null,
              is_deleted: false,
              identity_card: null
            }
          });
        } else {
          await tx.customers.update({
            where: { id: customer.id },
            data: { 
              full_name: customerName,
              ...(email && { email: email })
            }
          });
        }

        // Tạo booking with idempotency key
        const newBooking = await tx.bookings.create({
          data: {
            customer_id: customer.id,
            tour_id: tourId,
            account_id: accountId,
            start_date: new Date(startDate),
            end_date: new Date(endDate),
            total_amount: BigInt(amount),
            paid_amount: BigInt(0),
            status: BookingStatus.PENDING,
            total_passengers: totalPassengers,
            adults_count: adultsCount,
            children_count: childrenCount,
            special_requests: specialRequests || null,
            pickup_location: pickupLocation || null,
            dropoff_location: dropoffLocation || null,
            is_confirmed: false,
            idempotency_key: idempotencyKey
          },
          include: {
            customers: true,
            tours: {
              select: {
                title: true,
                location_name: true
              }
            }
          }
        });

        // Create booking passengers if provided
        if (passengers && passengers.length > 0) {
          // Transform camelCase to snake_case for passenger data
          const transformedPassengers = passengers.map(p => ({
            full_name: p.fullName,
            birth_date: p.birthDate,
            gender: p.gender,
            phone_number: p.phoneNumber,
            is_child: p.isChild
          }));

          const passengerResult = await PassengerValidationService.createBookingPassengers(
            newBooking.id,
            transformedPassengers,
            tx
          );

          if (!passengerResult.success) {
            throw new Error(passengerResult.error);
          }
        }

        // Log booking creation
        await tx.booking_logs.create({
          data: {
            booking_id: newBooking.id,
            status_from: null,
            status_to: BookingStatus.PENDING,
            action: 'booking_created',
            actor_id: accountId,
            actor_type: 'customer',
            notes: 'Booking được tạo thành công'
          }
        });

        // Create initial payment record
        const paymentResult = await PaymentService.createPayment(
          newBooking.id,
          Number(amount),
          'pending', // Will be updated when payment method is selected
          PaymentType.FULL,
          undefined,
          tx
        );

        // Transition to awaiting payment
        await BookingStateMachine.transition(
          newBooking.id,
          BookingStatus.AWAITING_PAYMENT,
          accountId,
          'customer',
          'Booking chờ thanh toán',
          undefined, // currentVersion
          tx // Pass transaction client
        );

        return newBooking;
      });

      // Gửi email xác nhận (outside transaction)
      console.log('BOOKING API: Sending confirmation email');
      if (email) {
        try {
          await sendBookingConfirmationEmail({
            email,
            customerName: booking.customers.full_name,
            tourTitle: booking.tours.title,
            location: booking.tours.location_name,
            amount: Number(booking.total_amount),
            startDate: booking.start_date,
            endDate: booking.end_date
          });
          console.log('BOOKING API: Email sent successfully');
        } catch (emailError) {
          console.error('BOOKING API: Email send error:', emailError);
          // Don't fail booking if email fails
        }
      } else {
        console.log('BOOKING API: No email provided, skipping email sending');
      }

      // Invalidate user bookings cache
      CacheInvalidator.invalidateUserBookings(accountId);

      // Invalidate tour cache if departure schedule was used
      if (departureScheduleId) {
        CacheInvalidator.invalidateDepartureSchedule(departureScheduleId);
      }

      return successResponse({
        booking: {
          id: booking.id,
          customerName: booking.customers.full_name,
          phone: booking.customers.phone_number,
          email: booking.customers.email,
          tourTitle: booking.tours.title,
          location: booking.tours.location_name,
          amount: Number(booking.total_amount),
          startDate: booking.start_date,
          endDate: booking.end_date,
          status: booking.status
        }
      }, 'Booking được tạo thành công');

    } catch (error) {
      console.error("BOOKING API: Booking error:", error);
      console.error("BOOKING API: Error stack:", error.stack);
      console.error("BOOKING API: Error message:", error.message);
      return errorResponse("Lỗi hệ thống, vui lòng thử lại sau", 500, error.message);
    }
  })(req);
}

export async function GET(req) {
  return requireAuth(async (request) => {
    try {
      const user = request.user;
      const { searchParams } = new URL(req.url);
      const requestedUserId = searchParams.get("user_id");

      // Users can only view their own bookings unless they are admins
      // Admins can view any user's bookings
      let userId;
      if (user.role_id === 1 && requestedUserId) {
        // Admin can view any user's bookings
        userId = parseInt(requestedUserId);
      } else {
        // Regular users can only view their own bookings
        userId = user.id;
      }

      const bookings = await prisma.bookings.findMany({
        where: {
          account_id: userId
        },
        include: {
          customers: {
            select: {
              full_name: true,
              phone_number: true
            }
          },
          tours: {
            select: {
              title: true,
              location_name: true,
              tour_images: {
                take: 1
              }
            }
          }
        },
        orderBy: { id: 'desc' }
      });

      return successResponse({
        bookings: bookings.map(booking => ({
          id: booking.id,
          customerName: booking.customers.full_name,
          phone: booking.customers.phone_number,
          tourTitle: booking.tours.title,
          location: booking.tours.location_name,
          tourImage: booking.tours.tour_images?.[0]?.image_url,
          amount: Number(booking.total_amount),
          paidAmount: Number(booking.paid_amount),
          startDate: booking.start_date,
          endDate: booking.end_date,
          status: booking.status,
          isConfirmed: booking.is_confirmed
        }))
      });

    } catch (error) {
      console.error("Get bookings error:", error);
      return errorResponse("Lỗi hệ thống", 500);
    }
  })(req);
}