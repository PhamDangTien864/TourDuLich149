import { NextResponse } from 'next/server';
import {
  sendBookingConfirmation,
  sendPaymentConfirmation,
  sendDepositReminder,
  sendTourReminder,
  sendCancellationEmail,
  sendRefundEmail,
  sendReviewRequest
} from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let result;
    switch (type) {
      case 'booking_confirmation':
        result = await sendBookingConfirmation(data);
        break;
      case 'payment_confirmation':
        result = await sendPaymentConfirmation(data);
        break;
      case 'deposit_reminder':
        result = await sendDepositReminder(data);
        break;
      case 'tour_reminder':
        result = await sendTourReminder(data);
        break;
      case 'cancellation':
        result = await sendCancellationEmail(data);
        break;
      case 'refund':
        result = await sendRefundEmail(data);
        break;
      case 'review_request':
        result = await sendReviewRequest(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in email API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
