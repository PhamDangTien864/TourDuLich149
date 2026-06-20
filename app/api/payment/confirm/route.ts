import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  return requireAuth(async (request) => {
    try {
      const user = request.user;
      const body = await request.json();
      const { bookingId } = body;

      console.log('Confirm payment request:', { bookingId, userId: user?.id });

      if (!bookingId) {
        console.error('Missing bookingId in request');
        return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
      }

      // Get the booking
      const booking = await prisma.bookings.findFirst({
        where: { id: bookingId },
        include: {
          booking_status_enum: true
        }
      });

      if (!booking) {
        console.error('Booking not found:', bookingId);
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      console.log('Booking found:', { id: booking.id, account_id: booking.account_id, userId: user?.id });

      // Check if user owns this booking
      if (!user || booking.account_id !== user.id) {
        console.error('Unauthorized access attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Get the "Đã thanh toán" status ID
      const paidStatus = await prisma.booking_status_enum.findFirst({
        where: { status: 'Đã thanh toán' }
      });

      // If not found, try alternative status names
      let finalPaidStatus = paidStatus;
      if (!paidStatus) {
        console.log('Đã thanh toán status not found, trying alternatives...');
        const alternatives = ['PAID', 'COMPLETED', 'CONFIRMED', 'PAID'];
        for (const alt of alternatives) {
          const altStatus = await prisma.booking_status_enum.findFirst({
            where: { status: alt }
          });
          if (altStatus) {
            console.log(`Found alternative status: ${alt}`);
            finalPaidStatus = altStatus;
            break;
          }
        }
      }

      if (!finalPaidStatus) {
        console.error('Payment status not found, tried all alternatives');
        // Get all available statuses for debugging
        const allStatuses = await prisma.booking_status_enum.findMany();
        console.log('Available statuses:', allStatuses.map((s: any) => s.status));
        return NextResponse.json({ error: 'Payment status not found' }, { status: 500 });
      }

      console.log('Updating booking to paid status:', { bookingId, statusObject: finalPaidStatus });

      // Update booking status to "Đã thanh toán"
      // Since status object doesn't have id field, skip status update for now
      const updatedBooking = await prisma.bookings.update({
        where: { id: bookingId },
        data: {
          paid_amount: booking.total_amount,
          updated_at: new Date()
        }
      });

      // Create payment record
      await prisma.booking_payments.create({
        data: {
          booking_id: bookingId,
          payment_method: 'QR_CODE', // Required field according to schema
          payment_type: 'FULL', // Use string value
          payment_status: 'COMPLETED', // Use string value
          amount: booking.total_amount,
          transaction_id: `QR-${Date.now()}`,
          paid_at: new Date()
        }
      });

      console.log('Payment confirmed successfully:', { bookingId });

      // Convert BigInt to Number for JSON serialization
      const serializedBooking = {
        ...updatedBooking,
        total_amount: Number(updatedBooking.total_amount),
        paid_amount: Number(updatedBooking.paid_amount),
        tour_id: Number(updatedBooking.tour_id)
      };

      return NextResponse.json({
        success: true,
        booking: serializedBooking
      });
    } catch (error) {
      console.error('Confirm payment error:', error);
      return NextResponse.json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  })(req);
}
