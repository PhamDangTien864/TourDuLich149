import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return requireRole([1, 2])(async (request) => {
    try {
      const { id } = params;
      const booking = await prisma.bookings.findUnique({
        where: { id: parseInt(id) },
        include: {
          customers: true,
          tours: true,
          booking_passengers: true,
          booking_payments: true
        }
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      return NextResponse.json(booking);
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
