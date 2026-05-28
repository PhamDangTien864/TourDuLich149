import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { bookingId } = await req.json();
  
  try {
    await prisma.bookings.update({
      where: { id: parseInt(bookingId) },
      data: { is_confirmed: true } // Hoặc tạo trạng thái 'WAITING_APPROVE'
    });
    return NextResponse.json({ success: true, message: "Đã gửi yêu cầu xác nhận!" });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
  }
}