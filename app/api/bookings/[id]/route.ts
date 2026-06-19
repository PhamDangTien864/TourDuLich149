import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAuth(async (request) => {
    try {
      const user = request.user;
      const { id } = await params;
      console.log('Raw booking ID from params:', id, 'type:', typeof id);
      
      const bookingId = parseInt(id, 10);
      console.log('Parsed booking ID:', bookingId, 'isNaN:', isNaN(bookingId));
      
      if (isNaN(bookingId)) {
        console.log('Invalid booking ID:', id);
        return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
      }
      
      const booking = await prisma.bookings.findFirst({
        where: { id: bookingId },
        include: {
          customers: true,
          tours: {
            include: {
              tour_images: true
            }
          },
          booking_passengers: true,
          booking_payments: {
            include: {
              payment_status_enum: false,
              payment_type_enum: false
            },
            orderBy: { created_at: 'desc' },
            take: 1
          },
          booking_status_enum: false
        }
      });

      if (!booking) {
        console.log('Booking not found:', bookingId);
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      console.log('Booking found:', booking.id, 'owner:', booking.account_id, 'requester:', user!.id);

      // Check if user owns this booking or is admin
      if (!user || (booking.account_id !== user.id && user.role_id !== 1)) {
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
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      return NextResponse.json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  })(req);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireRole([1])(async (request) => {
    try {
      const { id } = await params;
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireRole([1])(async (request) => {
    try {
      const { id } = await params;
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
