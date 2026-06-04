import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { BookingStateMachine } from '@/lib/booking-service';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(req) {
  return requireAuth(async (request) => {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return errorResponse('Thiếu bookingId', 400);
    }

    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: parseInt(bookingId) },
        include: { accounts: true }
      });

      if (!booking) {
        return errorResponse('Không tìm thấy đơn hàng', 404);
      }

      // Only admins or booking owner can confirm
      if (request.user.role_id !== 1 && booking.account_id !== request.user.id) {
        return errorResponse('Bạn không có quyền xác nhận booking này', 403);
      }

      // Use BookingStateMachine to transition status
      const result = await BookingStateMachine.transition(
        parseInt(bookingId),
        'CONFIRMED',
        request.user.id,
        request.user.role_id === 1 ? 'ADMIN' : 'CUSTOMER'
      );

      if (!result.success) {
        return errorResponse(result.error || 'Không thể xác nhận booking', 400);
      }

      return successResponse({}, 'Đã xác nhận booking thành công');
    } catch (error) {
      console.error('Error confirming booking:', error);
      return errorResponse('Lỗi khi xác nhận booking', 500);
    }
  })(req);
}