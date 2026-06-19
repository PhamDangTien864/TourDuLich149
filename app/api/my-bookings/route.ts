import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {
      account_id: user.id,
      is_deleted: false
    };

    // Validate status parameter against valid booking statuses
    const validStatuses = ['PENDING', 'AWAITING_PAYMENT', 'DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    if (status && validStatuses.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    const bookings = await prisma.bookings.findMany({
      where,
      include: {
        customers: {
          select: {
            full_name: true,
            phone_number: true,
            email: true
          }
        },
        tours: {
          select: {
            id: true,
            title: true,
            location_name: true,
            price: true,
            tour_images: {
              take: 1,
              orderBy: { is_primary: 'desc' }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      total_amount: Number(booking.total_amount),
      paid_amount: Number(booking.paid_amount || 0),
      tours: {
        ...booking.tours,
        price: booking.tours.price.toString()
      }
    }));

    return NextResponse.json({ 
      success: true, 
      bookings: formattedBookings 
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
