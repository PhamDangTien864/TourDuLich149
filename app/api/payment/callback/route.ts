import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyVNPayCallback } from '@/lib/vnpay';
import { BookingStatus, PaymentService, PaymentType } from '@/lib/booking-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = body;

    // Verify VNPay callback signature
    const isValid = verifyVNPayCallback(body);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Extract booking ID from order ID (format: BOOKING_{bookingId}_{timestamp})
    const orderId = vnp_TxnRef;
    const orderIdParts = orderId.split('_');
    if (orderIdParts.length < 2 || orderIdParts[0] !== 'BOOKING') {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    const bookingId = parseInt(orderIdParts[1]);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    // Find the booking
    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        booking_payments: {
          where: { transaction_id: orderId },
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if payment was successful (VNPay response code "00" means success)
    if (vnp_ResponseCode === '00') {
      // Update payment record
      const payment = booking.booking_payments?.[0];
      if (payment) {
        await prisma.booking_payments.update({
          where: { id: payment.id },
          data: {
            payment_status: 'COMPLETED',
            transaction_id: vnp_TransactionNo,
            paid_at: new Date()
          }
        });
      }

      // Update booking status and paid amount
      const paymentAmount = Number(vnp_Amount) / 100; // VNPay amount is in cents
      const newPaidAmount = Number(booking.paid_amount || 0) + paymentAmount;
      const bookingTotal = Number(booking.total_amount);

      let newStatus = booking.status;
      if (newPaidAmount >= bookingTotal) {
        newStatus = BookingStatus.CONFIRMED;
      } else if (newPaidAmount >= bookingTotal * 0.3) {
        newStatus = BookingStatus.DEPOSIT_PAID;
      }

      await prisma.bookings.update({
        where: { id: bookingId },
        data: {
          paid_amount: BigInt(newPaidAmount),
          status: newStatus
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Payment successful',
        bookingId,
        newStatus,
        paidAmount: newPaidAmount
      });
    } else {
      // Payment failed
      const payment = booking.booking_payments?.[0];
      if (payment) {
        await prisma.booking_payments.update({
          where: { id: payment.id },
          data: {
            payment_status: 'FAILED',
            transaction_id: vnp_TransactionNo
          }
        });
      }

      return NextResponse.json({
        success: false,
        message: 'Payment failed',
        bookingId,
        responseCode: vnp_ResponseCode
      });
    }
  } catch (error) {
    console.error('VNPay callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
