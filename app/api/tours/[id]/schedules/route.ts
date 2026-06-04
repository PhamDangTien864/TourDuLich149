import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse } from '@/lib/api-response';

const prisma = new PrismaClient();

// GET - Get all departure schedules for a tour
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const tourId = parseInt(idStr);
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');

    const schedules = await prisma.departure_schedules.findMany({
      where: {
        tour_id: tourId,
        is_active: true,
        ...(startDate && { departure_date: { gte: new Date(startDate) } })
      },
      orderBy: { departure_date: 'asc' }
    });

    // Calculate available slots for each schedule
    const schedulesWithAvailability = await Promise.all(
      schedules.map(async (schedule) => {
        const bookings = await prisma.bookings.findMany({
          where: {
            tour_id: tourId,
            start_date: schedule.departure_date,
            status: { in: ['PENDING', 'AWAITING_PAYMENT', 'DEPOSIT_PAID', 'CONFIRMED'] }
          }
        });

        const bookedSlots = bookings.reduce((sum, b) => sum + (b.total_passengers || 0), 0);

        return {
          ...schedule,
          available_slots: (schedule.total_slots || 0) - bookedSlots,
          is_available: ((schedule.total_slots || 0) - bookedSlots) > 0
        };
      })
    );

    return NextResponse.json({ schedules: schedulesWithAvailability });
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}

// POST - Create new departure schedule (Admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { departure_date, total_slots } = body;
    const { id: idStr } = await params;
    const tourId = parseInt(idStr);

    // Verify admin token (simplified)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedule = await prisma.departure_schedules.create({
      data: {
        tour_id: tourId,
        departure_date: new Date(departure_date),
        total_slots: total_slots || 20,
        available_slots: total_slots || 20
      }
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}
