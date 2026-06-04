import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware";
import { BookingStateMachine } from "@/lib/booking-service";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(req, { params }) {
  return requireRole([1])(async (request) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const { confirm } = body;

      const booking = await prisma.bookings.findUnique({
        where: { id: parseInt(id) },
        include: { accounts: true }
      });

      if (!booking) {
        return errorResponse('Không tìm thấy booking', 404);
      }

      if (confirm) {
        // Use BookingStateMachine to transition status
        const result = await BookingStateMachine.transition(
          parseInt(id),
          'CONFIRMED',
          request.user.id,
          'ADMIN'
        );

        if (!result.success) {
          return errorResponse(result.error || 'Không thể xác nhận booking', 400);
        }
      } else {
        // Cancel booking
        const result = await BookingStateMachine.transition(
          parseInt(id),
          'CANCELLED',
          request.user.id,
          'ADMIN'
        );

        if (!result.success) {
          return errorResponse(result.error || 'Không thể hủy booking', 400);
        }
      }

      return successResponse({}, confirm ? 'Đã xác nhận booking thành công' : 'Đã hủy booking thành công');
    } catch (error) {
      console.error("Confirm booking error:", error);
      return errorResponse('Lỗi hệ thống', 500);
    }
  })(req);
}
