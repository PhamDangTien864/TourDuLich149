import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { BookingStatus, BookingStateMachine, ActorType } from '@/lib/booking-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireRole([1])(async (request) => {
    try {
      const { id } = await params;
      const bookingId = parseInt(id, 10);

      if (isNaN(bookingId)) {
        return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
      }

      // Get the booking
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          customers: true,
          tours: true
        }
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      // Check if already fully paid
      const totalAmount = Number(booking.total_amount);
      const paidAmount = Number(booking.paid_amount || 0);
      
      if (paidAmount >= totalAmount) {
        return NextResponse.json({ error: 'Booking already fully paid' }, { status: 400 });
      }

      // Update booking: set paid_amount to total_amount and change status to CONFIRMED
      const updatedBooking = await prisma.$transaction(async (tx) => {
        // Update paid_amount to total_amount
        const updated = await tx.bookings.update({
          where: { id: bookingId },
          data: {
            paid_amount: booking.total_amount,
            is_confirmed: true
          },
          include: {
            customers: true,
            tours: true
          }
        });

        return updated;
      });

      // Transition status to CONFIRMED if not already CONFIRMED or COMPLETED
      if (booking.status !== BookingStatus.CONFIRMED &&
          booking.status !== BookingStatus.COMPLETED) {
        await BookingStateMachine.transition(
          bookingId,
          BookingStatus.CONFIRMED,
          request.user!.id,
          ActorType.ADMIN,
          'Admin đánh dấu đã thanh toán đầy đủ',
          undefined,
          prisma
        );
      }

      return NextResponse.json({
        success: true,
        booking: {
          id: updatedBooking.id,
          total_amount: Number(updatedBooking.total_amount),
          paid_amount: Number(updatedBooking.paid_amount),
          status: updatedBooking.status
        }
      });

    } catch (error) {
      console.error('Mark booking as paid error:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  })(req);
}
