import { NextResponse, NextRequest } from "next/server";
import { PaymentService, PaymentStatus } from "@/lib/booking-service";
import { authenticate } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { status, transactionId } = body;

    if (!status || !Object.values(PaymentStatus).includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái payment không hợp lệ" },
        { status: 400 }
      );
    }

    const { paymentId: paymentIdStr } = await params;
    const paymentId = parseInt(paymentIdStr);
    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Payment ID không hợp lệ" },
        { status: 400 }
      );
    }

    // Verify payment ownership - user can only update their own payments
    // Admins can update any payment
    const payment = await prisma.booking_payments.findUnique({
      where: { id: paymentId },
      include: { bookings: true }
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment không tồn tại" },
        { status: 404 }
      );
    }

    // Check if user owns this payment or is admin
    if (user.role_id !== 1 && payment.bookings.account_id !== user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền cập nhật payment này" },
        { status: 403 }
      );
    }

    const result = await PaymentService.updatePaymentStatus(
      paymentId,
      status as PaymentStatus,
      transactionId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Lỗi khi cập nhật payment status" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật payment status thành công"
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
