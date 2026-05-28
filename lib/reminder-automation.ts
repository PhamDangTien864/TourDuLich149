import { prisma } from '@/lib/prisma';
import { 
  sendDepositReminder,
  sendTourReminder
} from './email-service';

interface ReminderResult {
  type: string;
  sent: number;
  failed: number;
  details: string[];
}

export class ReminderAutomation {
  /**
   * Send deposit reminders for bookings that are pending payment
   * Runs daily for bookings created 3+ days ago
   */
  static async sendDepositReminders(): Promise<ReminderResult> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const pendingBookings = await prisma.bookings.findMany({
      where: {
        status: 'AWAITING_PAYMENT',
        created_at: { lte: threeDaysAgo },
        customers: { is_deleted: false }
      },
      include: {
        customers: true,
        tours: true
      }
    });

    const result: ReminderResult = {
      type: 'deposit_reminder',
      sent: 0,
      failed: 0,
      details: []
    };

    for (const booking of pendingBookings) {
      if (!booking.customers) continue;
      
      try {
        await sendDepositReminder({
          bookingId: booking.id,
          customerName: booking.customers.email || booking.customers.full_name,
          tourTitle: booking.tours.title,
          tourDate: booking.start_date.toISOString(),
          depositAmount: (Number(booking.total_amount) * 0.3).toString(), // 30% deposit
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        
        result.sent++;
        result.details.push(`Sent deposit reminder for booking #${booking.id}`);
      } catch (error) {
        result.failed++;
        result.details.push(`Failed to send deposit reminder for booking #${booking.id}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Send tour departure reminders
   * Runs 7 days before departure and 1 day before departure
   */
  static async sendTourReminders(): Promise<ReminderResult> {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    
    const upcomingBookings = await prisma.bookings.findMany({
      where: {
        status: 'CONFIRMED',
        start_date: {
          gte: oneDayFromNow,
          lte: sevenDaysFromNow
        },
        customers: { is_deleted: false }
      },
      include: {
        customers: true,
        tours: true
      }
    });

    const result: ReminderResult = {
      type: 'tour_reminder',
      sent: 0,
      failed: 0,
      details: []
    };

    for (const booking of upcomingBookings) {
      if (!booking.customers) continue;
      
      const daysUntilDeparture = Math.floor(
        (booking.start_date.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      try {
        await sendTourReminder({
          bookingId: booking.id,
          customerName: booking.customers.email || booking.customers.full_name,
          tourTitle: booking.tours.title,
          departureDate: booking.start_date.toISOString(),
          pickupLocation: booking.tours.location_name || 'VietTravel Office',
          pickupTime: '07:00', // Default pickup time
          contactPerson: 'VietTravel Support',
          contactPhone: '1900 xxxx'
        });
        
        result.sent++;
        result.details.push(`Sent tour reminder for booking #${booking.id} (${daysUntilDeparture} days)`);
      } catch (error) {
        result.failed++;
        result.details.push(`Failed to send tour reminder for booking #${booking.id}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Send payment reminders for incomplete payments
   * Runs weekly for bookings with partial payments
   */
  static async sendPaymentReminders(): Promise<ReminderResult> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const partialPaymentBookings = await prisma.bookings.findMany({
      where: {
        status: 'CONFIRMED',
        paid_amount: { lt: prisma.bookings.fields.total_amount },
        updated_at: { lte: oneWeekAgo },
        customers: { is_deleted: false }
      },
      include: {
        customers: true,
        tours: true
      }
    });

    const result: ReminderResult = {
      type: 'payment_reminder',
      sent: 0,
      failed: 0,
      details: []
    };

    for (const booking of partialPaymentBookings) {
      if (!booking.customers) continue;
      
      const remainingAmount = Number(booking.total_amount) - Number(booking.paid_amount);
      
      try {
        // Use deposit reminder for payment reminders as well
        await sendDepositReminder({
          bookingId: booking.id,
          customerName: booking.customers.email || booking.customers.full_name,
          tourTitle: booking.tours.title,
          tourDate: booking.start_date.toISOString(),
          depositAmount: remainingAmount.toString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        
        result.sent++;
        result.details.push(`Sent payment reminder for booking #${booking.id}`);
      } catch (error) {
        result.failed++;
        result.details.push(`Failed to send payment reminder for booking #${booking.id}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Run all reminder automations
   */
  static async runAllAutomations(): Promise<ReminderResult[]> {
    const results = await Promise.all([
      this.sendDepositReminders(),
      this.sendTourReminders(),
      this.sendPaymentReminders()
    ]);

    return results;
  }

  /**
   * Get reminder statistics
   */
  static async getReminderStats() {
    const [
      pendingDepositBookings,
      upcomingTours,
      partialPaymentBookings
    ] = await Promise.all([
      prisma.bookings.count({
        where: {
          status: 'AWAITING_PAYMENT',
          created_at: { lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.bookings.count({
        where: {
          status: 'CONFIRMED',
          start_date: {
            gte: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.bookings.count({
        where: {
          status: 'CONFIRMED',
          paid_amount: { lt: prisma.bookings.fields.total_amount }
        }
      })
    ]);

    return {
      pendingDepositReminders: pendingDepositBookings,
      upcomingTourReminders: upcomingTours,
      paymentReminders: partialPaymentBookings
    };
  }
}
