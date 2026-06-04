import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request, { params }) {
  return requireRole([1])(async (req) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { admin_reply } = body;

      if (!admin_reply) {
        return errorResponse('Thiếu nội dung phản hồi', 400);
      }

      const review = await prisma.reviews.update({
        where: { id: Number(id) },
        data: { admin_reply }
      });

      return successResponse(review, 'Đã thêm phản hồi thành công');
    } catch (error) {
      console.error('Error adding admin reply:', error);
      return errorResponse('Lỗi khi thêm phản hồi', 500);
    }
  })(request);
}
