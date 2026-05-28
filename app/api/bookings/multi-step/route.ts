import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse } from '@/lib/api-response';
import { BookingStatus, ActorType } from '@/lib/booking-service';

const prisma = new PrismaClient();

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: number };
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
    const schedule = tour.departure_schedules?.[0];
    if (schedule && (schedule.available_slots || 0) < (adults_count + children_count)) {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: number };
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
        phone_number: p.phone_number,
        is_child: p.is_child || false
      }))
    });

    // Update booking status
    const updatedBooking = await prisma.bookings.update({
      where: { id: booking_id },
      data: { status: BookingStatus.AWAITING_PAYMENT },
      include: {
        booking_passengers: true
      }
    });

    // Create booking log
    await prisma.booking_logs.create({
      data: {
        booking_id,
        status_from: BookingStatus.PENDING,
        status_to: BookingStatus.AWAITING_PAYMENT,
        action: 'passengers_added',
        actor_id: account_id,
        actor_type: ActorType.CUSTOMER,
        notes: `Added ${createdPassengers.count} passengers`
      }
    });

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}
