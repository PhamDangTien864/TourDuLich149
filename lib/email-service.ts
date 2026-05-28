import { Resend } from 'resend';
import {
  generateBookingConfirmationEmail,
  BookingConfirmationData
} from './email-templates/booking-confirmation';
import {
  generatePaymentConfirmationEmail,
  PaymentConfirmationData
} from './email-templates/payment-confirmation';
import {
  generateDepositReminderEmail,
  DepositReminderData
} from './email-templates/deposit-reminder';
import {
  generateTourReminderEmail,
  TourReminderData
} from './email-templates/tour-reminder';
import {
  generateCancellationEmail,
  CancellationData
} from './email-templates/cancellation';
import {
  generateRefundEmail,
  RefundData
} from './email-templates/refund';
import {
  generateReviewRequestEmail,
  ReviewRequestData
} from './email-templates/review-request';
import { ErrorHandler } from './errors';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email send');
      return { success: false, error: 'API key not configured' };
    }

    const result = await resend.emails.send({
      from: 'VietTravel <noreply@viettravel.com>',
      to,
      subject,
      html,
    });

    return { success: true, data: result };
  } catch (error) {
    ErrorHandler.log(ErrorHandler.handle(error), 'Error sending email');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Booking Confirmation Email
export async function sendBookingConfirmation(data: BookingConfirmationData) {
  const html = generateBookingConfirmationEmail(data);
  return sendEmail({
    to: data.customerName, // In production, this should be the actual email
    subject: `Xác nhận đặt tour #${data.bookingId} - VietTravel`,
    html
  });
}

// Payment Confirmation Email
export async function sendPaymentConfirmation(data: PaymentConfirmationData) {
  const html = generatePaymentConfirmationEmail(data);
  return sendEmail({
    to: data.customerName,
    subject: `Xác nhận thanh toán #${data.bookingId} - VietTravel`,
    html
  });
}

// Deposit Reminder Email
export async function sendDepositReminder(data: DepositReminderData) {
  const html = generateDepositReminderEmail(data);
  return sendEmail({
    to: data.customerName,
    subject: `Nhắc nhở thanh toán cọc #${data.bookingId} - VietTravel`,
    html
  });
}

// Tour Reminder Email
export async function sendTourReminder(data: TourReminderData) {
  const html = generateTourReminderEmail(data);
  return sendEmail({
    to: data.customerName,
    subject: `Nhắc nhở khởi hành tour #${data.bookingId} - VietTravel`,
    html
  });
}

// Cancellation Email
export async function sendCancellationEmail(data: CancellationData) {
  const html = generateCancellationEmail(data);
  return sendEmail({
    to: data.customerName,
    subject: `Xác nhận hủy tour #${data.bookingId} - VietTravel`,
    html
  });
}

// Refund Email
export async function sendRefundEmail(data: RefundData) {
  const html = generateRefundEmail(data);
  return sendEmail({
    to: data.customerName,
    subject: `Hoàn tiền tour #${data.bookingId} - VietTravel`,
    html
  });
}

// Review Request Email
export async function sendReviewRequest(data: ReviewRequestData) {
  const html = generateReviewRequestEmail(data);
  return sendEmail({
    to: data.customerName,
    subject: `Đánh giá tour của bạn #${data.bookingId} - VietTravel`,
    html
  });
}

// Email Service API Route
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
        return Response.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    ErrorHandler.log(ErrorHandler.handle(error), 'Error in email service');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
