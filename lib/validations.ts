import { z } from 'zod';

// Login validation schema - Admin & Customer
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username phải từ 3 ký tự')
    .max(50, 'Username tối đa 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ được chứa chữ, số và dấu gạch dưới'),
  password: z.string()
    .min(6, 'Mật khẩu phải từ 6 ký tự'),
});

// Register validation schema - Customer registration only
export const registerSchema = z.object({
  full_name: z.string()
    .min(2, 'Họ tên phải từ 2 ký tự')
    .max(100, 'Họ tên quá dài'),
  phone_number: z.string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải từ 10-11 số'),
  username: z.string()
    .min(3, 'Username phải từ 3 ký tự')
    .max(50, 'Username tối đa 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username không được chứa ký tự đặc biệt'),
  email: z.string()
    .email('Email không đúng định dạng (ví dụ: customer@gmail.com)'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Mật khẩu phải có chữ hoa, chữ thường và số'),
  birth_date: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      if (isNaN(birthDate.getTime())) return false;
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Chua sinh nhat trong nam nay -> giam 1
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 16; // Customer phai tren 16 tuoi
    }, 'Bạn phải đủ 16 tuổi và ngày sinh hợp lệ'),
});

// Tour validation schema
export const tourSchema = z.object({
  title: z.string()
    .min(5, 'Tên tour phải từ 5 ký tự')
    .max(255, 'Tên tour quá dài'),
  location_name: z.string()
    .min(2, 'Tên địa điểm phải từ 2 ký tự')
    .max(100, 'Tên địa điểm quá dài'),
  price: z.number()
    .min(100000, 'Giá tour phải lớn hơn 100,000 VND'),
  category_id: z.number()
    .positive('Category phải hợp lệ'),
  description: z.string()
    .min(10, 'Mô tả phải từ 10 ký tự')
    .max(5000, 'Mô tả quá dài'),
  max_slots: z.number()
    .min(1, 'Số chỗ phải lớn hơn 0')
    .max(100, 'Số chỗ tối đa 100'),
});

// Booking validation schema
export const bookingSchema = z.object({
  customer_id: z.number()
    .positive('Customer ID phải hợp lệ'),
  tour_id: z.number()
    .positive('Tour ID phải hợp lệ'),
  start_date: z.string()
    .refine((date) => new Date(date) > new Date(), 'Ngày bắt đầu không hợp lệ'),
  end_date: z.string()
    .refine((date) => new Date(date) > new Date(), 'Ngày kết thúc không hợp lệ'),
  total_amount: z.number()
    .min(0, 'Tổng số tiên không được âm'),
});

// Review validation schema
export const reviewSchema = z.object({
  tour_id: z.number()
    .positive('Tour ID phải hợp lệ'),
  rating: z.number()
    .min(1, 'Đánh giá phải từ 1 sao')
    .max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string()
    .min(10, 'Bình luận phải từ 10 kí tự')
    .max(1000, 'Bình luận quá dài'),
  images: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const urls = val.split(',').map(s => s.trim());
      return urls.every(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
    }, 'URL ảnh không hợp lệ'),
});

// Customer validation schema (cho admin tao customer)
export const customerSchema = z.object({
  full_name: z.string()
    .min(2, 'Họ tên phải từ 2 kí tự')
    .max(100, 'Họ tên quá dài'),
  phone_number: z.string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10 số'),
  email: z.string()
    .email('Email không đúng định dạng'),
  address: z.string()
    .max(255, 'Địa chỉ quá dài')
    .optional(),
  birth_date: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 0; // Customer co the la em be
    }, 'Ngày sinh không hợp lệ'),
});

// Role validation schema (cho admin)
export const roleSchema = z.object({
  role_name: z.string()
    .min(2, 'Tên role phải từ 2 ký tự')
    .max(50, 'Tên role quá dài'),
  description: z.string()
    .max(200, 'Mô tả quá dài'),
  permissions: z.string()
    .optional(),
});

// Booking validation schema - Production-ready with business rules
export const bookingRequestSchema = z.object({
  tourId: z.number()
    .positive('Tour ID phải hợp lệ'),
  departureScheduleId: z.number()
    .positive('Schedule ID phải hợp lệ')
    .optional(),
  amount: z.number()
    .min(100000, 'Tổng số tiền phải lớn hơn 100,000 VND'),
  customerName: z.string()
    .min(2, 'Họ tên phải từ 2 ký tự')
    .max(100, 'Họ tên quá dài'),
  phone: z.string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải từ 10-11 số'),
  email: z.string()
    .email('Email không đúng định dạng')
    .optional(),
  startDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Ngày bắt đầu không hợp lệ')
    .refine((date) => new Date(date) > new Date(), 'Ngày bắt đầu phải trong tương lai'),
  endDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Ngày kết thúc không hợp lệ')
    .refine((date) => new Date(date) > new Date(), 'Ngày kết thúc phải trong tương lai'),
  adultsCount: z.number()
    .min(1, 'Số người lớn phải ít nhất 1')
    .max(50, 'Số người lớn tối đa 50'),
  childrenCount: z.number()
    .min(0, 'Số trẻ em không được âm')
    .max(50, 'Số trẻ em tối đa 50'),
  passengers: z.array(z.object({
    fullName: z.string()
      .min(2, 'Họ tên hành khách phải từ 2 ký tự')
      .max(100, 'Họ tên quá dài'),
    birthDate: z.string()
      .refine((date) => !isNaN(Date.parse(date)), 'Ngày sinh không hợp lệ'),
    gender: z.enum(['Nam', 'Nữ', 'Khác']),
    phoneNumber: z.string()
      .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải từ 10-11 số'),
    isChild: z.boolean()
  })).optional(),
  specialRequests: z.string()
    .max(1000, 'Yêu cầu đặc biệt quá dài')
    .optional(),
  pickupLocation: z.string()
    .max(255, 'Địa điểm đón quá dài')
    .optional(),
  dropoffLocation: z.string()
    .max(255, 'Địa điểm trả quá dài')
    .optional(),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDate']
}).refine((data) => {
  if (data.passengers && data.passengers.length > 0) {
    const totalPassengers = data.passengers.length;
    const expectedCount = data.adultsCount + data.childrenCount;
    return totalPassengers === expectedCount;
  }
  return true;
}, {
  message: 'Số lượng hành khách không khớp với số lượng người lớn + trẻ em',
  path: ['passengers']
}).refine((data) => {
  // Business rule: Total passengers must not exceed 50
  const totalPassengers = data.adultsCount + data.childrenCount;
  return totalPassengers <= 50;
}, {
  message: 'Tổng số hành khách không được vượt quá 50',
  path: ['adultsCount']
}).refine((data) => {
  // Business rule: At least 1 adult required
  return data.adultsCount >= 1;
}, {
  message: 'Phải có ít nhất 1 người lớn',
  path: ['adultsCount']
}).refine((data) => {
  // Business rule: Children per adult ratio (max 3 children per adult)
  if (data.childrenCount > 0) {
    const maxChildren = data.adultsCount * 3;
    return data.childrenCount <= maxChildren;
  }
  return true;
}, {
  message: 'Số trẻ em không được vượt quá 3 lần số người lớn',
  path: ['childrenCount']
});

// Passenger validation schema
export const passengerSchema = z.object({
  fullName: z.string()
    .min(2, 'Họ tên phải từ 2 ký tự')
    .max(100, 'Họ tên quá dài'),
  birthDate: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 0 && age <= 120;
    }, 'Ngày sinh không hợp lệ'),
  gender: z.enum(['Nam', 'Nữ', 'Khác']),
  phoneNumber: z.string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải từ 10-11 số'),
  isChild: z.boolean()
}).refine((data) => {
  const birthDate = new Date(data.birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (data.isChild && age >= 12) {
    return false;
  }
  if (!data.isChild && age < 12) {
    return false;
  }
  return true;
}, {
  message: 'Tuổi không khớp với loại hành khách',
  path: ['isChild']
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TourInput = z.infer<typeof tourSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type PassengerInput = z.infer<typeof passengerSchema>;