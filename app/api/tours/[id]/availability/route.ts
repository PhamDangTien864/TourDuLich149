import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse } from '@/lib/api-response';

const prisma = new PrismaClient();

// GET - Check tour availability
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const tourId = parseInt(idStr);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Get tour details
    const tour = await prisma.tours.findUnique({
      where: { id: tourId },
      include: {
        departure_schedules: {
          where: {
            is_active: true,
            ...(date && { departure_date: { gte: new Date(date) } })
          },
          orderBy: { departure_date: 'asc' }
        },
        bookings: {
          where: {
            status: { in: ['PENDING', 'AWAITING_PAYMENT', 'DEPOSIT_PAID', 'CONFIRMED'] }
          }
        }
      }
    });

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Calculate available slots for each schedule
    const schedulesWithAvailability = tour.departure_schedules.map(schedule => {
      const bookedSlots = tour.bookings
        .filter(b => b.start_date.getTime() === schedule.departure_date.getTime())
        .reduce((sum, b) => sum + (b.total_passengers || 0), 0);

      return {
        ...schedule,
        available_slots: (schedule.total_slots || 0) - bookedSlots,
        is_available: ((schedule.total_slots || 0) - bookedSlots) > 0
      };
    });

    // Get cancellation policy
    const cancellationPolicy = await prisma.cancellation_policies.findFirst({
      where: {
        OR: [
          { tour_id: tourId },
          { is_default: true }
        ]
      },
      orderBy: { days_before: 'desc' }
    });

    return NextResponse.json({
      tour: {
        id: tour.id,
        title: tour.title,
        price: tour.price,
        max_slots: tour.max_slots,
        duration_days: tour.duration_days,
        pickup_location: tour.pickup_location,
        dropoff_location: tour.dropoff_location
      },
      schedules: schedulesWithAvailability,
      cancellationPolicy
    });
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}
