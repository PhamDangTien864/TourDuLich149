import { prisma } from './prisma';
import { ErrorHandler } from './errors';
import { PrismaClient } from '@prisma/client';

// Booking status enum - Matches Prisma schema exactly
export enum BookingStatus {
  PENDING = 'PENDING',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

// Payment status enum - Matches Prisma schema exactly
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Actor type enum - Matches Prisma schema exactly
export enum ActorType {
  SYSTEM = 'SYSTEM',
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

// Payment type enum - Matches Prisma schema exactly
export enum PaymentType {
  FULL = 'FULL',
  DEPOSIT = 'DEPOSIT',
  REMAINING = 'REMAINING'
}

// Booking state machine
export class BookingStateMachine {
  static transitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.AWAITING_PAYMENT, BookingStatus.CANCELLED],
    [BookingStatus.AWAITING_PAYMENT]: [BookingStatus.DEPOSIT_PAID, BookingStatus.CANCELLED],
    [BookingStatus.DEPOSIT_PAID]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    [BookingStatus.COMPLETED]: [BookingStatus.REFUNDED],
    [BookingStatus.CANCELLED]: [BookingStatus.REFUNDED],
    [BookingStatus.REFUNDED]: []
  };

  static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return this.transitions[from]?.includes(to) || false;
  }

  static async transition(
    bookingId: number,
    toStatus: BookingStatus,
    actorId?: number,
    actorType: ActorType = ActorType.SYSTEM,
    notes?: string,
    currentVersion?: number, // For optimistic locking
    prismaClient?: PrismaClient // Optional prisma client for transactions
  ): Promise<{ success: boolean; error?: string; newVersion?: number }> {
    try {
      const client = prismaClient || prisma;
      const booking = await client.bookings.findUnique({
        where: { id: bookingId }
      });

      if (!booking) {
        return { success: false, error: 'Booking không tồn tại' };
      }

      // Check version if provided (optimistic locking)
      if (currentVersion !== undefined && booking.version !== currentVersion) {
        return {
          success: false,
          error: `Booking đã được sửa bởi người khác. Vui lòng tải lại trang.`
        };
      }

      if (!this.canTransition(booking.status as BookingStatus, toStatus)) {
        return {
          success: false,
          error: `Không thể chuyển từ ${booking.status} sang ${toStatus}`
        };
      }

      // Update booking status with version increment
      const updatedBooking = await client.bookings.update({
        where: { id: bookingId },
        data: {
          status: toStatus,
          version: { increment: 1 }
        }
      });

      // Log the transition
      await client.booking_logs.create({
        data: {
          booking_id: bookingId,
          status_from: booking.status,
          status_to: toStatus,
          action: `status_change_${toStatus}`,
          actor_id: actorId,
          actor_type: actorType,
          notes: notes || `Chuyển trạng thái từ ${booking.status} sang ${toStatus}`
        }
      });

      return { success: true, newVersion: updatedBooking.version ?? undefined};
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Status transition error');
      return { success: false, error: 'Lỗi hệ thống khi chuyển trạng thái' };
    }
  }
}

// Payment service
export class PaymentService {
  static async createPayment(
    bookingId: number,
    amount: number,
    paymentMethod: string,
    paymentType: PaymentType = PaymentType.FULL,
    transactionId?: string,
    tx?: any // Optional transaction for atomic operations
  ): Promise<{ success: boolean; paymentId?: number; error?: string }> {
    try {
      const prismaClient = tx || prisma;
      
      const payment = await prismaClient.booking_payments.create({
        data: {
          booking_id: bookingId,
          amount: BigInt(amount),
          payment_method: paymentMethod,
          payment_status: PaymentStatus.PENDING,
          payment_type: paymentType,
          transaction_id: transactionId || null
        }
      });

      return { success: true, paymentId: payment.id };
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Create payment error');
      return { success: false, error: 'Lỗi khi tạo payment' };
    }
  }

  static async updatePaymentStatus(
    paymentId: number,
    status: PaymentStatus,
    transactionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const payment = await prisma.booking_payments.findUnique({
        where: { id: paymentId },
        include: { bookings: true }
      });

      if (!payment) {
        return { success: false, error: 'Payment không tồn tại' };
      }

      // Update payment status
      await prisma.booking_payments.update({
        where: { id: paymentId },
        data: {
          payment_status: status,
          ...(transactionId && { transaction_id: transactionId }),
          ...(status === PaymentStatus.COMPLETED && { paid_at: new Date() })
        }
      });

      // Update booking status based on payment
      if (status === PaymentStatus.COMPLETED) {
        let newBookingStatus: BookingStatus;
        
        if (payment.payment_type === PaymentType.DEPOSIT) {
          newBookingStatus = BookingStatus.DEPOSIT_PAID;
        } else if (payment.payment_type === PaymentType.REMAINING) {
          newBookingStatus = BookingStatus.CONFIRMED;
        } else {
          newBookingStatus = BookingStatus.CONFIRMED;
        }

        await BookingStateMachine.transition(
          payment.booking_id,
          newBookingStatus,
          undefined,
          ActorType.SYSTEM,
          `Payment ${payment.payment_type} completed`
        );

        // Update booking paid amount
        const currentPaid = payment.bookings.paid_amount || BigInt(0);
        await prisma.bookings.update({
          where: { id: payment.booking_id },
          data: {
            paid_amount: currentPaid + payment.amount,
            is_confirmed: newBookingStatus === BookingStatus.CONFIRMED
          }
        });
      }

      return { success: true };
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Update payment status error');
      return { success: false, error: 'Lỗi khi cập nhật payment status' };
    }
  }

  static calculateDepositAmount(totalAmount: number, depositPercent: number = 30): number {
    return Math.floor(totalAmount * (depositPercent / 100));
  }

  static async getBookingPayments(bookingId: number): Promise<any[]> {
    try {
      const payments = await prisma.booking_payments.findMany({
        where: { booking_id: bookingId },
        orderBy: { created_at: 'desc' }
      });

      return payments.map(p => ({
        ...p,
        amount: Number(p.amount)
      }));
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Get booking payments error');
      return [];
    }
  }
}

// Slot reservation service with database-level locking
export class SlotReservationService {
  private static RESERVATION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  static async reserveSlot(
    tourId: number,
    scheduleId: number | null,
    passengersCount: number,
    accountId: number,
    tx?: any // Optional transaction for atomic operations
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const prismaClient = tx || prisma;

      // Check if tour exists and is active
      const tour = await prismaClient.tours.findUnique({
        where: { id: tourId, is_active: true, is_deleted: false },
        select: { max_slots: true }
      });

      if (!tour) {
        return { success: false, error: 'Tour không tồn tại hoặc không hoạt động' };
      }

      // Check for duplicate pending bookings BEFORE reserving slots
      const existingBooking = await prismaClient.bookings.findFirst({
        where: {
          tour_id: tourId,
          account_id: accountId,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.AWAITING_PAYMENT, BookingStatus.DEPOSIT_PAID]
          },
          created_at: {
            gte: new Date(Date.now() - this.RESERVATION_TIMEOUT)
          }
        }
      });

      if (existingBooking) {
        return { success: false, error: 'Bạn đã có booking đang chờ xử lý cho tour này' };
      }

      // Check schedule availability if scheduleId provided with row-level locking
      if (scheduleId) {
        // Use transaction with row-level locking to prevent race conditions
        const schedule = await prismaClient.departure_schedules.findUnique({
          where: { id: scheduleId, is_active: true }
        });

        if (!schedule) {
          return { success: false, error: 'Lịch khởi hành không tồn tại' };
        }

        if (schedule.available_slots < passengersCount) {
          return { success: false, error: 'Không đủ chỗ trống' };
        }

        // Atomic slot reservation with decrement
        await prismaClient.departure_schedules.update({
          where: { id: scheduleId },
          data: {
            available_slots: {
              decrement: passengersCount
            }
          }
        });
      }

      return { success: true };
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Slot reservation error');
      return { success: false, error: 'Lỗi hệ thống khi đặt chỗ' };
    }
  }

  static async releaseSlot(
    tourId: number,
    scheduleId: number | null,
    passengersCount: number,
    tx?: any // Optional transaction for atomic operations
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      
      if (scheduleId) {
        await prismaClient.departure_schedules.update({
          where: { id: scheduleId },
          data: {
            available_slots: {
              increment: passengersCount
            }
          }
        });
      }
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Slot release error');
    }
  }

  static async cleanupExpiredReservations(): Promise<void> {
    try {
      const expiredBookings = await prisma.bookings.findMany({
        where: {
          status: {
            in: [BookingStatus.PENDING, BookingStatus.AWAITING_PAYMENT]
          },
          created_at: {
            lt: new Date(Date.now() - this.RESERVATION_TIMEOUT)
          }
        }
      });

      for (const booking of expiredBookings) {
        // Cancel expired bookings
        // Slots are managed at tour level via max_slots, so we don't need to release specific schedule slots
        // The tour's max_slots will naturally be available for new bookings
        await BookingStateMachine.transition(
          booking.id,
          BookingStatus.CANCELLED,
          undefined,
          ActorType.SYSTEM,
          'Booking tự động hủy do hết thời gian chờ thanh toán'
        );
      }
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Cleanup expired reservations error');
    }
  }
}

// Passenger validation service
export class PassengerValidationService {
  static validatePassenger(passenger: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!passenger.full_name || passenger.full_name.trim().length < 2) {
      errors.push('Họ tên hành khách phải từ 2 ký tự');
    }

    if (!passenger.birth_date || !Date.parse(passenger.birth_date)) {
      errors.push('Ngày sinh không hợp lệ');
    }

    if (!passenger.gender || !['Nam', 'Nữ', 'Khác'].includes(passenger.gender)) {
      errors.push('Giới tính không hợp lệ (Nam/Nữ/Khác)');
    }

    // Phone is required for adults, optional for children
    if (!passenger.is_child) {
      if (!passenger.phone_number || !/^[0-9]{10}$/.test(passenger.phone_number)) {
        errors.push('Người lớn phải có số điện thoại (10 số)');
      }
    } else if (passenger.phone_number && !/^[0-9]{10}$/.test(passenger.phone_number)) {
      // If provided for children, must still be valid format
      errors.push('Số điện thoại phải 10 số');
    }

    // Validate age
    const birthDate = new Date(passenger.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 0) {
      errors.push('Ngày sinh không hợp lệ');
    }

    if (passenger.is_child && age >= 12) {
      errors.push('Hành khách được đánh dấu là trẻ em nhưng tuổi >= 12');
    }

    if (!passenger.is_child && age < 12) {
      errors.push('Hành khách được đánh dấu là người lớn nhưng tuổi < 12');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static async createBookingPassengers(
    bookingId: number,
    passengers: any[],
    tx?: any // Optional transaction for atomic operations
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const prismaClient = tx || prisma;
      
      // Validate all passengers first
      for (const passenger of passengers) {
        const validation = this.validatePassenger(passenger);
        if (!validation.valid) {
          return { 
            success: false, 
            error: `Lỗi hành khách ${passenger.full_name}: ${validation.errors.join(', ')}` 
          };
        }
      }

      // Create passengers
      await prismaClient.booking_passengers.createMany({
        data: passengers.map(p => ({
          booking_id: bookingId,
          full_name: p.full_name.trim(),
          birth_date: new Date(p.birth_date),
          gender: p.gender,
          phone_number: p.phone_number,
          is_child: p.is_child || false
        }))
      });

      return { success: true };
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Create booking passengers error');
      return { success: false, error: 'Lỗi khi tạo thông tin hành khách' };
    }
  }

  static async getBookingPassengers(bookingId: number): Promise<any[]> {
    try {
      const passengers = await prisma.booking_passengers.findMany({
        where: { booking_id: bookingId },
        orderBy: { is_child: 'asc' } // Adults first
      });

      return passengers;
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Get booking passengers error');
      return [];
    }
  }
}

// Booking validation service
export class BookingValidationService {
  static validateBookingData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.tourId || isNaN(Number(data.tourId))) {
      errors.push('Tour ID không hợp lệ');
    }

    if (!data.adultsCount || data.adultsCount < 1) {
      errors.push('Số người lớn phải ít nhất 1');
    }

    if (data.childrenCount < 0) {
      errors.push('Số trẻ em không được âm');
    }

    if (!data.startDate || !Date.parse(data.startDate)) {
      errors.push('Ngày bắt đầu không hợp lệ');
    }

    if (!data.endDate || !Date.parse(data.endDate)) {
      errors.push('Ngày kết thúc không hợp lệ');
    }

    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      errors.push('Ngày kết thúc phải sau ngày bắt đầu');
    }

    // Validate passengers count
    if (data.passengers && data.passengers.length > 0) {
      const totalPassengers = data.passengers.length;
      const expectedCount = (data.adultsCount || 1) + (data.childrenCount || 0);
      
      if (totalPassengers !== expectedCount) {
        errors.push(`Số lượng hành khách (${totalPassengers}) không khớp với số lượng người lớn (${data.adultsCount || 1}) + trẻ em (${data.childrenCount || 0})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static async checkDuplicateBooking(
    tourId: number,
    accountId: number,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const existingBooking = await prisma.bookings.findFirst({
      where: {
        tour_id: tourId,
        account_id: accountId,
        is_deleted: false,
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.REFUNDED]
        },
        OR: [
          {
            AND: [
              { start_date: { lte: startDate } },
              { end_date: { gte: startDate } }
            ]
          },
          {
            AND: [
              { start_date: { lte: endDate } },
              { end_date: { gte: endDate } }
            ]
          },
          {
            AND: [
              { start_date: { gte: startDate } },
              { end_date: { lte: endDate } }
            ]
          }
        ]
      }
    });

    return !!existingBooking;
  }
}
