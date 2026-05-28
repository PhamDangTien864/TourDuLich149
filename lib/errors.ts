// Structured error handling for booking system
// Provides custom error classes for better error handling and debugging

export class BookingError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'BookingError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode
    };
  }
}

// Booking-specific errors
export class SlotUnavailableError extends BookingError {
  constructor(message: string = 'Không đủ chỗ trống', details?: any) {
    super('SLOT_UNAVAILABLE', message, details, 400);
    this.name = 'SlotUnavailableError';
  }
}

export class TourNotFoundError extends BookingError {
  constructor(tourId: number) {
    super('TOUR_NOT_FOUND', `Tour không tồn tại hoặc không hoạt động`, { tourId }, 404);
    this.name = 'TourNotFoundError';
  }
}

export class ScheduleNotFoundError extends BookingError {
  constructor(scheduleId: number) {
    super('SCHEDULE_NOT_FOUND', `Lịch khởi hành không tồn tại`, { scheduleId }, 404);
    this.name = 'ScheduleNotFoundError';
  }
}

export class DuplicateBookingError extends BookingError {
  constructor(details?: any) {
    super('DUPLICATE_BOOKING', 'Bạn đã có booking trùng thời gian cho tour này', details, 409);
    this.name = 'DuplicateBookingError';
  }
}

export class InvalidPassengerDataError extends BookingError {
  constructor(errors: string[]) {
    super('INVALID_PASSENGER_DATA', 'Dữ liệu hành khách không hợp lệ', { errors }, 400);
    this.name = 'InvalidPassengerDataError';
  }
}

export class InvalidBookingDataError extends BookingError {
  constructor(errors: string[]) {
    super('INVALID_BOOKING_DATA', 'Dữ liệu booking không hợp lệ', { errors }, 400);
    this.name = 'InvalidBookingDataError';
  }
}

export class PaymentError extends BookingError {
  constructor(message: string, details?: any) {
    super('PAYMENT_ERROR', message, details, 400);
    this.name = 'PaymentError';
  }
}

export class PaymentAmountMismatchError extends PaymentError {
  constructor(expectedAmount: number, providedAmount: number) {
    super(
      'Số thanh toán không khớp',
      { expectedAmount, providedAmount }
    );
    this.name = 'PaymentAmountMismatchError';
  }
}

export class InvalidBookingStatusError extends BookingError {
  constructor(currentStatus: string, requiredStatus: string) {
    super(
      'INVALID_BOOKING_STATUS',
      `Booking không ở trạng thái phù hợp. Hiện tại: ${currentStatus}, Yêu cầu: ${requiredStatus}`,
      { currentStatus, requiredStatus },
      400
    );
    this.name = 'InvalidBookingStatusError';
  }
}

export class BookingTransitionError extends BookingError {
  constructor(fromStatus: string, toStatus: string, reason?: string) {
    super(
      'BOOKING_TRANSITION_ERROR',
      `Không thể chuyển từ ${fromStatus} sang ${toStatus}${reason ? ': ' + reason : ''}`,
      { fromStatus, toStatus, reason },
      400
    );
    this.name = 'BookingTransitionError';
  }
}

export class AuthenticationError extends BookingError {
  constructor(message: string = 'Bạn cần đăng nhập để thực hiện hành động này') {
    super('AUTHENTICATION_ERROR', message, undefined, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends BookingError {
  constructor(message: string = 'Bạn không có quyền thực hiện hành động này') {
    super('AUTHORIZATION_ERROR', message, undefined, 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends BookingError {
  constructor(errors: string[] | Record<string, string>) {
    super('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors }, 400);
    this.name = 'ValidationError';
  }
}

// Error handler utility
export class ErrorHandler {
  static handle(error: unknown): BookingError {
    if (error instanceof BookingError) {
      return error;
    }

    if (error instanceof Error) {
      // Convert generic errors to BookingError
      return new BookingError(
        'INTERNAL_ERROR',
        error.message,
        { originalError: error.name },
        500
      );
    }

    return new BookingError(
      'UNKNOWN_ERROR',
      'Đã xảy ra lỗi không xác định',
      { originalError: String(error) },
      500
    );
  }

  static toResponse(error: BookingError): Response {
    return new Response(
      JSON.stringify(error.toJSON()),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  static log(error: BookingError, context?: string): void {
    console.error(`[${error.code}] ${context || 'Booking Error'}:`, error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Type guard for checking if an error is a BookingError
export function isBookingError(error: unknown): error is BookingError {
  return error instanceof BookingError;
}
