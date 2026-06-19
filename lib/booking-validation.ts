import { z } from 'zod';
import { prisma } from './prisma';
import { ErrorHandler } from './errors';
import { BookingStatus } from './booking-service';

// Centralized booking validation logic
// This file consolidates all booking-related validation to avoid duplication

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PassengerData {
  fullName: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  phoneNumber: string;
  isChild: boolean;
}

export interface BookingRequestData {
  tourId: number;
  departureScheduleId?: number;
  amount: number;
  customerName: string;
  phone: string;
  email?: string;
  startDate: string;
  endDate: string;
  adultsCount: number;
  childrenCount: number;
  passengers?: PassengerData[];
  specialRequests?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
}

// Passenger validation - single source of truth
export class PassengerValidator {
  static validate(passenger: PassengerData): ValidationResult {
    const errors: string[] = [];

    // Validate full name
    if (!passenger.fullName || passenger.fullName.trim().length < 2) {
      errors.push('Họ tên hành khách phải từ 2 ký tự');
    }

    // Validate birth date
    if (!passenger.birthDate || !Date.parse(passenger.birthDate)) {
      errors.push('Ngày sinh không hợp lệ');
    }

    // Validate gender
    if (!passenger.gender || !['Nam', 'Nữ', 'Khác'].includes(passenger.gender)) {
      errors.push('Giới tính không hợp lệ (Nam/Nữ/Khác)');
    }

    // Validate phone number
    if (!passenger.phoneNumber || !/^[0-9]{10}$/.test(passenger.phoneNumber)) {
      errors.push('Số điện thoại phải 10 số');
    }

    // Validate age and child/adult consistency
    const birthDate = new Date(passenger.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 0) {
      errors.push('Ngày sinh không hợp lệ');
    }

    if (passenger.isChild && age >= 12) {
      errors.push('Hành khách được đánh dấu là trẻ em nhưng tuổi >= 12');
    }

    if (!passenger.isChild && age < 12) {
      errors.push('Hành khách được đánh dấu là người lớn nhưng tuổi < 12');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateMultiple(passengers: PassengerData[]): ValidationResult {
    const allErrors: string[] = [];
    
    passengers.forEach((passenger, index) => {
      const result = this.validate(passenger);
      if (!result.valid) {
        result.errors.forEach(error => {
          allErrors.push(`Hành khách ${index + 1}: ${error}`);
        });
      }
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }

  // Check for duplicate phone numbers among passengers
  static checkDuplicatePhoneNumbers(passengers: PassengerData[]): ValidationResult {
    const phoneNumbers = passengers.map(p => p.phoneNumber);
    const uniquePhones = new Set(phoneNumbers);
    
    if (phoneNumbers.length !== uniquePhones.size) {
      return {
        valid: false,
        errors: ['Có số điện thoại trùng lặp giữa các hành khách']
      };
    }

    return { valid: true, errors: [] };
  }
}

// Customer information validation
export class CustomerValidator {
  static validate(customerName: string, phone: string, email?: string): ValidationResult {
    const errors: string[] = [];

    // Validate customer name
    if (!customerName || customerName.trim().length < 2) {
      errors.push('Họ tên phải từ 2 ký tự');
    }

    // Validate phone number
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      errors.push('Số điện thoại phải 10 số');
    }

    // Validate email (optional)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email không đúng định dạng');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Booking request validation
export class BookingValidator {
  static validateBasicData(data: Omit<BookingRequestData, 'passengers'>): ValidationResult {
    const errors: string[] = [];

    // Validate tour ID
    if (!data.tourId || isNaN(Number(data.tourId))) {
      errors.push('Tour ID không hợp lệ');
    }

    // Validate adults count
    if (!data.adultsCount || data.adultsCount < 1) {
      errors.push('Số người lớn phải ít nhất 1');
    }

    // Validate children count
    if (data.childrenCount < 0) {
      errors.push('Số trẻ em không được âm');
    }

    // Validate dates
    if (!data.startDate || !Date.parse(data.startDate)) {
      errors.push('Ngày bắt đầu không hợp lệ');
    }

    if (!data.endDate || !Date.parse(data.endDate)) {
      errors.push('Ngày kết thúc không hợp lệ');
    }

    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      errors.push('Ngày kết thúc phải sau ngày bắt đầu');
    }

    // Validate amount
    if (!data.amount || data.amount < 100000) {
      errors.push('Tổng số tiền phải lớn hơn 100,000 VND');
    }

    // Validate customer info
    const customerValidation = CustomerValidator.validate(
      data.customerName,
      data.phone,
      data.email
    );
    if (!customerValidation.valid) {
      errors.push(...customerValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validatePassengersCount(
    adultsCount: number,
    childrenCount: number,
    passengers?: PassengerData[]
  ): ValidationResult {
    const errors: string[] = [];

    if (passengers && passengers.length > 0) {
      const totalPassengers = passengers.length;
      const expectedCount = adultsCount + childrenCount;
      
      if (totalPassengers !== expectedCount) {
        errors.push(
          `Số lượng hành khách (${totalPassengers}) không khớp với số lượng người lớn (${adultsCount}) + trẻ em (${childrenCount})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static async validateTourAvailability(tourId: number): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      const tour = await prisma.tours.findUnique({
        where: { id: tourId, is_active: true, is_deleted: false }
      });

      if (!tour) {
        errors.push('Tour không tồn tại hoặc không hoạt động');
      }
    } catch (error) {
      errors.push('Lỗi khi kiểm tra tour');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static async validateScheduleAvailability(
    scheduleId: number,
    passengersCount: number
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      const schedule = await prisma.departure_schedules.findUnique({
        where: { id: scheduleId, is_active: true }
      });

      if (!schedule) {
        errors.push('Lịch khởi hành không tồn tại');
      } else if ((schedule.available_slots ?? 0) < passengersCount) {
        errors.push('Không đủ chỗ trống');
      }
    } catch (error) {
      errors.push('Lỗi khi kiểm tra lịch khởi hành');
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
    try {
      const existingBooking = await prisma.bookings.findFirst({
        where: {
          tour_id: tourId,
          account_id: accountId,
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
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error));
      return false;
    }
  }

  // Comprehensive validation that combines all checks
  static async validateBookingRequest(
    data: BookingRequestData,
    accountId: number
  ): Promise<ValidationResult> {
    const allErrors: string[] = [];

    // Basic data validation
    const basicValidation = this.validateBasicData(data);
    if (!basicValidation.valid) {
      allErrors.push(...basicValidation.errors);
    }

    // Passengers count validation
    const passengersCountValidation = this.validatePassengersCount(
      data.adultsCount,
      data.childrenCount,
      data.passengers
    );
    if (!passengersCountValidation.valid) {
      allErrors.push(...passengersCountValidation.errors);
    }

    // Passenger data validation
    if (data.passengers && data.passengers.length > 0) {
      const passengerValidation = PassengerValidator.validateMultiple(data.passengers);
      if (!passengerValidation.valid) {
        allErrors.push(...passengerValidation.errors);
      }

      const duplicatePhoneValidation = PassengerValidator.checkDuplicatePhoneNumbers(data.passengers);
      if (!duplicatePhoneValidation.valid) {
        allErrors.push(...duplicatePhoneValidation.errors);
      }
    }

    // Tour availability validation
    const tourValidation = await this.validateTourAvailability(data.tourId);
    if (!tourValidation.valid) {
      allErrors.push(...tourValidation.errors);
    }

    // Schedule availability validation
    if (data.departureScheduleId) {
      const totalPassengers = data.adultsCount + data.childrenCount;
      const scheduleValidation = await this.validateScheduleAvailability(
        data.departureScheduleId,
        totalPassengers
      );
      if (!scheduleValidation.valid) {
        allErrors.push(...scheduleValidation.errors);
      }
    }

    // Duplicate booking check
    const isDuplicate = await this.checkDuplicateBooking(
      data.tourId,
      accountId,
      new Date(data.startDate),
      new Date(data.endDate)
    );
    if (isDuplicate) {
      allErrors.push('Bạn đã có booking trùng thời gian cho tour này');
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }
}

// Export convenience functions for backward compatibility
export const validatePassenger = (passenger: PassengerData) => 
  PassengerValidator.validate(passenger);

export const validateBookingData = (data: any) => 
  BookingValidator.validateBasicData(data);

export const checkDuplicateBooking = (
  tourId: number,
  accountId: number,
  startDate: Date,
  endDate: Date
) => BookingValidator.checkDuplicateBooking(tourId, accountId, startDate, endDate);
