import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { createVNPayPaymentUrl } from '@/lib/vnpay';
import { BookingStatus, PaymentService, PaymentType } from '@/lib/booking-service';
import { PaymentAmountMismatchError, InvalidBookingStatusError } from '@/lib/errors';
import { BOOKING_CONFIG } from '@/lib/config/booking';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để thanh toán' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, amount, bankCode } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Thiếu thông tin booking hoặc số tiền' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Số thanh toán phải là số dương' },
        { status: 400 }
      );
    }

    // Verify booking belongs to user
    const booking = await prisma.bookings.findFirst({
      where: {
        id: parseInt(bookingId),
        account_id: user.id,
      },
      include: {
        tours: true,
        booking_payments: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }

    // Validate booking status - only allow payment for AWAITING_PAYMENT or DEPOSIT_PAID
    if (booking.status !== BookingStatus.AWAITING_PAYMENT && 
        booking.status !== BookingStatus.DEPOSIT_PAID) {
      return NextResponse.json(
        { 
          error: 'Booking không ở trạng thái chờ thanh toán',
          currentStatus: booking.status,
          requiredStatus: [BookingStatus.AWAITING_PAYMENT, BookingStatus.DEPOSIT_PAID]
        },
        { status: 400 }
      );
    }

    // Validate payment amount matches booking total or deposit amount
    const bookingTotal = Number(booking.total_amount);
    const depositAmount = Math.floor(bookingTotal * (BOOKING_CONFIG.DEPOSIT_PERCENTAGE / 100));
    const paidAmount = Number(booking.paid_amount || 0);
    const remainingAmount = bookingTotal - paidAmount;

    // Allow payment for either full amount, deposit amount, or remaining amount
    // Use exact matching to prevent exploitation (reduced tolerance from 100 VND to 1 VND)
    const validAmounts = [bookingTotal, depositAmount, remainingAmount];
    const isAmountValid = validAmounts.some(validAmount => 
      Math.abs(amount - validAmount) < 1 // Allow minimal rounding differences only
    );

    if (!isAmountValid) {
      return NextResponse.json(
        { 
          error: 'Số thanh toán không khớp',
          providedAmount: amount,
          expectedAmounts: {
            full: bookingTotal,
            deposit: depositAmount,
            remaining: remainingAmount
          }
        },
        { status: 400 }
      );
    }

    // Check if there's already a pending payment for this booking
    const existingPendingPayment = booking.booking_payments?.[0];
    if (existingPendingPayment && existingPendingPayment.payment_status === 'PENDING') {
      // Return existing payment URL if it's still valid (within timeout)
      const paymentAge = Date.now() - new Date(existingPendingPayment.created_at ?? Date.now()).getTime();
      if (paymentAge < BOOKING_CONFIG.PAYMENT_TIMEOUT) {
        // In a real implementation, you would return the existing payment URL
        // For now, we'll create a new one
      }
    }

    // Get client IP
    const ipAddr = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   '127.0.0.1';

    // Create VNPay payment URL
    const orderId = `BOOKING_${booking.id}_${Date.now()}`;
    const orderInfo = `Thanh toan tour ${booking.tours.title} - Booking #${booking.id}`;
    
    const paymentUrl = createVNPayPaymentUrl({
      amount: parseInt(amount),
      orderId,
      orderInfo,
      bankCode,
      ipAddr,
    });

    // Update or create payment record with PENDING status
    if (existingPendingPayment && existingPendingPayment.payment_status === 'PENDING') {
      await prisma.booking_payments.update({
        where: { id: existingPendingPayment.id },
        data: {
          amount: BigInt(amount),
          transaction_id: orderId,
          payment_method: bankCode || 'vnpay'
        }
      });
    } else {
      await PaymentService.createPayment(
        booking.id,
        Number(amount),
        bankCode || 'vnpay',
        amount === depositAmount ? PaymentType.DEPOSIT : PaymentType.FULL,
        orderId
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId,
      bookingId: booking.id,
      amount: amount,
    });

  } catch (error) {
    console.error('VNPay create payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Lỗi tạo thanh toán', details: errorMessage },
      { status: 500 }
    );
  }
}
