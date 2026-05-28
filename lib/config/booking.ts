// Booking system configuration
// Centralized configuration for booking-related constants and business rules

export const BOOKING_CONFIG = {
  // Timeouts (in milliseconds)
  RESERVATION_TIMEOUT_MINUTES: 15,
  RESERVATION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  PAYMENT_TIMEOUT_MINUTES: 30,
  PAYMENT_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // Payment rules
  DEPOSIT_PERCENTAGE: 30, // 30% deposit
  MIN_DEPOSIT_AMOUNT: 100000, // Minimum deposit in VND
  MIN_BOOKING_AMOUNT: 100000, // Minimum booking amount in VND
  
  // Passenger rules
  MIN_PASSENGERS_PER_BOOKING: 1,
  MAX_PASSENGERS_PER_BOOKING: 50,
  CHILD_AGE_THRESHOLD: 12, // Age threshold for child vs adult
  MAX_CHILDREN_PER_ADULT: 3, // Maximum children per adult
  
  // Slot management
  DEFAULT_MAX_SLOTS: 100,
  LOW_SLOT_THRESHOLD: 5, // Consider "low availability" when slots <= 5
  CRITICAL_SLOT_THRESHOLD: 2, // Consider "critical" when slots <= 2
  
  // Cancellation policies
  DEFAULT_CANCELLATION_HOURS: 24, // Hours before departure for free cancellation
  REFUND_PERCENTAGES: {
    FULL_REFUND_DAYS: 7, // Full refund if cancelled 7+ days before
    PARTIAL_REFUND_DAYS: 3, // 50% refund if cancelled 3-7 days before
    NO_REFUND_DAYS: 0 // No refund if cancelled < 3 days before
  },
  
  // Booking status transitions
  ALLOWED_TRANSITIONS: {
    PENDING: ['AWAITING_PAYMENT', 'CANCELLED'],
    AWAITING_PAYMENT: ['DEPOSIT_PAID', 'CONFIRMED', 'CANCELLED'],
    DEPOSIT_PAID: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: ['REFUNDED'],
    CANCELLED: ['REFUNDED'],
    REFUNDED: []
  },
  
  // Validation rules
  PHONE_NUMBER_REGEX: /^[0-9]{10,11}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  SPECIAL_REQUEST_MAX_LENGTH: 1000,
  LOCATION_MAX_LENGTH: 255,
  
  // Idempotency
  IDEMPOTENCY_KEY_EXPIRY_HOURS: 24,
  IDEMPOTENCY_KEY_PREFIX: 'booking_',
  
  // Retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  
  // Pagination
  DEFAULT_BOOKINGS_PAGE_SIZE: 20,
  MAX_BOOKINGS_PAGE_SIZE: 100,
  
  // Cache configuration
  BOOKING_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  TOUR_CACHE_TTL: 15 * 60 * 1000, // 15 minutes
  SCHEDULE_CACHE_TTL: 1 * 60 * 1000, // 1 minute
} as const;

// Helper functions for booking calculations
export const BookingCalculations = {
  /**
   * Calculate deposit amount based on total amount
   */
  calculateDepositAmount(totalAmount: number, depositPercent: number = BOOKING_CONFIG.DEPOSIT_PERCENTAGE): number {
    return Math.floor(totalAmount * (depositPercent / 100));
  },
  
  /**
   * Calculate remaining amount after deposit
   */
  calculateRemainingAmount(totalAmount: number, depositAmount: number): number {
    return totalAmount - depositAmount;
  },
  
  /**
   * Calculate child price (70% of adult price by default)
   */
  calculateChildPrice(adultPrice: number, childDiscountPercent: number = 30): number {
    return Math.floor(adultPrice * ((100 - childDiscountPercent) / 100));
  },
  
  /**
   * Calculate total price for booking
   */
  calculateTotalPrice(
    adultPrice: number,
    adultsCount: number,
    childrenCount: number,
    childDiscountPercent: number = 30
  ): number {
    const adultsTotal = adultPrice * adultsCount;
    const childPrice = this.calculateChildPrice(adultPrice, childDiscountPercent);
    const childrenTotal = childPrice * childrenCount;
    return adultsTotal + childrenTotal;
  },
  
  /**
   * Calculate refund amount based on cancellation policy
   */
  calculateRefundAmount(
    totalAmount: number,
    daysBeforeDeparture: number
  ): { refundAmount: number; refundPercent: number } {
    const { FULL_REFUND_DAYS, PARTIAL_REFUND_DAYS } = BOOKING_CONFIG.REFUND_PERCENTAGES;
    
    if (daysBeforeDeparture >= FULL_REFUND_DAYS) {
      return { refundAmount: totalAmount, refundPercent: 100 };
    } else if (daysBeforeDeparture >= PARTIAL_REFUND_DAYS) {
      const refundAmount = Math.floor(totalAmount * 0.5);
      return { refundAmount, refundPercent: 50 };
    } else {
      return { refundAmount: 0, refundPercent: 0 };
    }
  },
  
  /**
   * Check if booking is eligible for free cancellation
   */
  isEligibleForFreeCancellation(
    departureDate: Date,
    hoursBeforeDeparture: number = BOOKING_CONFIG.DEFAULT_CANCELLATION_HOURS
  ): boolean {
    const now = new Date();
    const cancellationDeadline = new Date(departureDate.getTime() - hoursBeforeDeparture * 60 * 60 * 1000);
    return now < cancellationDeadline;
  },
  
  /**
   * Calculate days until departure
   */
  calculateDaysUntilDeparture(departureDate: Date): number {
    const now = new Date();
    const departure = new Date(departureDate);
    const diffTime = departure.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },
  
  /**
   * Check if passenger is a child based on age
   */
  isChild(birthDate: Date, ageThreshold: number = BOOKING_CONFIG.CHILD_AGE_THRESHOLD): boolean {
    const now = new Date();
    const birth = new Date(birthDate);
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age < ageThreshold;
  },
  
  /**
   * Calculate passenger age
   */
  calculateAge(birthDate: Date): number {
    const now = new Date();
    const birth = new Date(birthDate);
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  },
  
  /**
   * Check if slot availability is low
   */
  isLowSlotAvailability(availableSlots: number): boolean {
    return availableSlots <= BOOKING_CONFIG.LOW_SLOT_THRESHOLD;
  },
  
  /**
   * Check if slot availability is critical
   */
  isCriticalSlotAvailability(availableSlots: number): boolean {
    return availableSlots <= BOOKING_CONFIG.CRITICAL_SLOT_THRESHOLD;
  },
  
  /**
   * Generate idempotency key
   */
  generateIdempotencyKey(userId: number): string {
    return `${BOOKING_CONFIG.IDEMPOTENCY_KEY_PREFIX}${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
};

// Export constants for backward compatibility
export const {
  RESERVATION_TIMEOUT,
  DEPOSIT_PERCENTAGE,
  MIN_BOOKING_AMOUNT,
  MIN_PASSENGERS_PER_BOOKING,
  MAX_PASSENGERS_PER_BOOKING,
  CHILD_AGE_THRESHOLD
} = BOOKING_CONFIG;
