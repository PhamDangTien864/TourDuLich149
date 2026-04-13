import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username phải từ 3 ký tự')
    .max(50, 'Username tối đa 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ được chứa chữ, số và dấu gạch dưới'),
  password: z.string()
    .min(6, 'Mật khẩu phải từ 6 ký tự')
});

// Register validation schema - ĐÃ TÁCH RIÊNG USERNAME VÀ EMAIL
export const registerSchema = z.object({
  full_name: z.string()
    .min(2, 'Họ tên phải từ 2 ký tự')
    .max(50, 'Họ tên quá dài'),
  phone_number: z.string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải từ 10-11 số'),
  username: z.string()
    .min(3, 'Username phải từ 3 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username không được chứa ký tự đặc biệt'),
  email: z.string()
    .email('Email không đúng định dạng (ví dụ: ni@gmail.com)'), // TRƯỜNG MỚI
  password: z.string()
    .min(6, 'Mât khâu phai tù 6 ky tu')
    .regex(/^(?=.*[a-z])(?=.*[A-Z]).*$/, 'Mât khâu phai có chù hoa và chù thuong'),
  birth_date: z.string()
    .refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      return age >= 18;
    }, 'Ní phải trên 18 tuổi mới được đi tour nha'),
});

// Các schema khác (Tour, Booking, Review) giữ nguyên như cũ của ní...
export const tourSchema = z.object({ /* giữ nguyên */ });
export const bookingSchema = z.object({ /* giữ nguyên */ });
export const reviewSchema = z.object({ /* giữ nguyên */ });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;