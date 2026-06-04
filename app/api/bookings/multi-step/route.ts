import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse } from '@/lib/api-response';
import { BookingStatus, ActorType, BookingStateMachine } from '@/lib/booking-service';
import { prisma } from '@/lib/prisma';

// POST - Tạo booking mới (Step 1: Initial booking)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tour_id,
      start_date,
      end_date,
      adults_count,
      children_count,
      special_requests,
      pickup_location,
      dropoff_location
    } = body;

    // Verify token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return errorResponse('JWT_SECRET environment variable is not set', 500);
    }
    const decoded = jwt.verify(token, jwtSecret) as { id: number };
    const account_id = decoded.id;

    // Get tour details
    const tour = await prisma.tours.findUnique({
      where: { id: tour_id },
      include: {
        departure_schedules: true
      }
    });

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Check availability
    // TODO: Race condition - Two concurrent requests can both pass this check and exceed available slots
    // Need to implement atomic decrement using SELECT FOR UPDATE or optimistic locking
    const schedule = tour.departure_schedules?.find(s => 
      new Date(s.departure_date).getTime() === new Date(start_date).getTime()
    );
    if (!schedule) {
      return NextResponse.json({ error: 'No schedule found for the selected date' }, { status: 400 });
    }
    if ((schedule.available_slots || 0) < (adults_count + children_count)) {
      return NextResponse.json({ error: 'Not enough available slots' }, { status: 400 });
    }

    // Calculate total amount
    const total_passengers = adults_count + children_count;
    const total_amount = BigInt(tour.price) * BigInt(total_passengers);

    // Create booking
    const booking = await prisma.bookings.create({
      data: {
        tour_id,
        account_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        total_amount,
        status: BookingStatus.PENDING,
        total_passengers,
        adults_count,
        children_count,
        special_requests,
        pickup_location,
        dropoff_location
      },
      include: {
        tours: true
      }
    });

    // Create booking log
    await prisma.booking_logs.create({
      data: {
        booking_id: booking.id,
        status_from: null,
        status_to: BookingStatus.PENDING,
        action: 'booking_created',
        actor_id: account_id,
        actor_type: ActorType.CUSTOMER,
        notes: 'Booking created via multi-step flow'
      }
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}

// PUT - Update booking (Step 2: Add passengers)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { booking_id, passengers } = body;

    // Verify token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return errorResponse('JWT_SECRET environment variable is not set', 500);
    }
    const decoded = jwt.verify(token, jwtSecret) as { id: number };
    const account_id = decoded.id;

    // Verify booking ownership
    const booking = await prisma.bookings.findUnique({
      where: { id: booking_id }
    });

    if (!booking || booking.account_id !== account_id) {
      return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 });
    }

    // Create passengers
    const createdPassengers = await prisma.booking_passengers.createMany({
      data: passengers.map((p: any) => ({
        booking_id,
        full_name: p.full_name,
        birth_date: new Date(p.birth_date),
        gender: p.gender,
        phone_number: p.phone_number || '',
        is_child: p.is_child || false
      }))
    });

    // Update booking status using State Machine
    const transitionResult = await BookingStateMachine.transition(
      booking_id,
      BookingStatus.AWAITING_PAYMENT,
      account_id,
      ActorType.CUSTOMER,
      `Added ${createdPassengers.count} passengers`,
      undefined,
      prisma
    );

    if (!transitionResult.success) {
      return errorResponse(transitionResult.error || 'Failed to transition booking status', 400);
    }

    const updatedBooking = await prisma.bookings.findUnique({
      where: { id: booking_id },
      include: {
        booking_passengers: true
      }
    });

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}
