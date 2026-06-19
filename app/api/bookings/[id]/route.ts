import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(async (request) => {
    try {
      const user = request.user;
      const { id } = params;
      console.log('Raw booking ID from params:', id, 'type:', typeof id);
      
      const bookingId = parseInt(id, 10);
      console.log('Parsed booking ID:', bookingId, 'isNaN:', isNaN(bookingId));
      
      if (isNaN(bookingId)) {
        console.log('Invalid booking ID:', id);
        return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
      }
      
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          customers: true,
          tours: true,
          booking_passengers: true,
          booking_payments: true
        }
      });

      if (!booking) {
        console.log('Booking not found:', bookingId);
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      console.log('Booking found:', booking.id, 'owner:', booking.account_id, 'requester:', user.id);

      // Check if user owns this booking or is admin
      if (booking.account_id !== user.id && user.role_id !== 1) {
        console.log('Unauthorized access attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      return NextResponse.json({ 
        success: true,
        booking: {
          ...booking,
          total_amount: Number(booking.total_amount),
          paid_amount: Number(booking.paid_amount || 0),
          tour_id: booking.tour_id
        }
      });
    } catch (error) {
      console.error('Get booking error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return NextResponse.json({ 
        error: 'Internal server error',
        details: error.message 
      }, { status: 500 });
    }
  })(req);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return requireRole([1])(async (request) => {
    try {
      const { id } = params;
      const body = await request.json();

      const updated = await prisma.bookings.update({
        where: { id: parseInt(id) },
        data: body
      });

      return NextResponse.json(updated);
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return requireRole([1])(async (request) => {
    try {
      const { id } = params;
      await prisma.bookings.update({
        where: { id: parseInt(id) },
        data: { is_deleted: true }
      });

      return NextResponse.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(req);
}
