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
      const user = request.user;
      const accountId = user.id;
      const body = await req.json();
      
      // Generate or use provided idempotency key using cryptographically secure random
      const idempotencyKey = body.idempotencyKey || `booking_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
      
      // Validate with Zod using centralized validation
      const validationResult = bookingRequestSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message);
        return validationErrorResponse(errors);
      }

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
        return conflictResponse("Bạn đã có booking trùng thời gian cho tour này");
      }

      // Wrap entire booking creation in transaction for atomicity
      const booking = await prisma.$transaction(async (tx) => {
        const totalPassengers = adultsCount + childrenCount;

        // Reserve slots with transaction
        const reservation = await SlotReservationService.reserveSlot(
          tourId,
          departureScheduleId,
          totalPassengers,
          accountId,
          tx
        );

        if (!reservation.success) {
          throw new Error(reservation.error || "Không thể đặt chỗ");
        }

        // Tạo customer mới hoặc tìm customer existing
        let customer = await tx.customers.findFirst({
          where: { phone_number: phone, is_deleted: false }
        });

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
            departure_schedule_id: departureScheduleId,
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
          const passengerResult = await PassengerValidationService.createBookingPassengers(
            newBooking.id,
            passengers,
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
        } catch (emailError) {
          console.error('Email send error:', emailError);
          // Don't fail booking if email fails
        }
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
      console.error("Booking error:", error);
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