import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyVNPayCallback, getVNPayResponseCode } from '@/lib/vnpay';
import { ErrorHandler } from '@/lib/errors';
import { BookingStatus } from '@/lib/booking-service';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Verify VNPay callback
    const isValid = verifyVNPayCallback(params);

    if (!isValid) {
      return NextResponse.redirect(
        new URL('/payment?status=invalid', req.url)
      );
    }

    const vnp_ResponseCode = params['vnp_ResponseCode'];
    const vnp_TxnRef = params['vnp_TxnRef'];
    const vnp_TransactionNo = params['vnp_TransactionNo'];
    const vnp_Amount = params['vnp_Amount'];

    // Extract booking ID from order ID (format: BOOKING_{bookingId}_{timestamp})
    const bookingIdMatch = vnp_TxnRef.match(/BOOKING_(\d+)_/);
    if (!bookingIdMatch) {
      return NextResponse.redirect(
        new URL('/payment?status=invalid', req.url)
      );
    }

    const bookingId = parseInt(bookingIdMatch[1]);

    if (vnp_ResponseCode === '00') {
      // Payment successful
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
      });

      await prisma.bookings.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          is_confirmed: true,
          paid_amount: BigInt(vnp_Amount) / BigInt(100), // Convert back from cents
        },
      });

      // Create transaction record with VNPay info
      await prisma.transactions.create({
        data: {
          booking_id: bookingId,
          account_id: booking?.account_id || 0,
          amount: BigInt(vnp_Amount) / BigInt(100),
          transaction_type: 'payment',
          vnp_txn_ref: vnp_TxnRef,
          vnp_transaction_no: vnp_TransactionNo,
          vnp_bank_code: params['vnp_BankCode'],
          vnp_response_code: vnp_ResponseCode,
        },
      });

      return NextResponse.redirect(
        new URL('/payment?status=success', req.url)
      );
    } else {
      // Payment failed
      const errorMessage = getVNPayResponseCode(vnp_ResponseCode);
      return NextResponse.redirect(
        new URL(`/payment?status=failed&message=${encodeURIComponent(errorMessage)}`, req.url)
      );
    }
  } catch (error) {
    ErrorHandler.log(ErrorHandler.handle(error), 'VNPay callback error');
    return NextResponse.redirect(
      new URL('/payment?status=error', req.url)
    );
  }
}
