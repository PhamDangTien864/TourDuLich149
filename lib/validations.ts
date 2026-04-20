import { z } from 'zod';

// Login validation schema - Admin & Customer
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username phai tu 3 ky tu')
    .max(50, 'Username toi da 50 ky tu')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chi duoc chua chu, so va dau gach duoi'),
  password: z.string()
    .min(6, 'Mat khau phai tu 6 ky tu'),
});

// Register validation schema - Customer registration only
export const registerSchema = z.object({
  full_name: z.string()
    .min(2, 'Ho ten phai tu 2 ky tu')
    .max(100, 'Ho ten qua dai'),
  phone_number: z.string()
    .regex(/^[0-9]{10,11}$/, 'So dien thoai phai tu 10-11 so'),
  username: z.string()
    .min(3, 'Username phai tu 3 ky tu')
    .max(50, 'Username toi da 50 ky tu')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username khong duoc chua ky tu dac biet'),
  email: z.string()
    .email('Email khong dung dinh dang (vi du: customer@gmail.com)'),
  password: z.string()
    .min(6, 'Mat khau phai tu 6 ky tu')
    .regex(/^(?=.*[a-z])(?=.*[A-Z]).*$/, 'Mat khau phai co chu hoa va chu thuong'),
  birth_date: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Chua sinh nhat trong nam nay -> giam 1
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 16; // Customer phai tren 16 tuoi
    }, 'Customer phai tren 16 tuoi moi duoc dang ky'),
});

// Tour validation schema
export const tourSchema = z.object({
  title: z.string()
    .min(5, 'Ten tour phai tu 5 ky tu')
    .max(255, 'Ten tour qua dai'),
  location_name: z.string()
    .min(2, 'Ten dia diem phai tu 2 ky tu')
    .max(100, 'Ten dia diem qua dai'),
  price: z.number()
    .min(100000, 'Gia tour phai lon hon 100,000 VND'),
  category_id: z.number()
    .positive('Category phai hop le'),
  description: z.string()
    .min(10, 'Mo ta phai tu 10 ky tu')
    .max(5000, 'Mo ta qua dai'),
  max_slots: z.number()
    .min(1, 'So cho phai lon hon 0')
    .max(100, 'So cho toi da 100'),
});

// Booking validation schema
export const bookingSchema = z.object({
  customer_id: z.number()
    .positive('Customer ID phai hop le'),
  tour_id: z.number()
    .positive('Tour ID phai hop le'),
  start_date: z.string()
    .refine((date) => new Date(date) > new Date(), 'Ngay bat dau phai trong tuong lai'),
  end_date: z.string()
    .refine((date) => new Date(date) > new Date(), 'Ngay ket thuc phai trong tuong lai'),
  total_amount: z.number()
    .min(0, 'Tong so tien khong duoc am'),
});

// Review validation schema
export const reviewSchema = z.object({
  tour_id: z.number()
    .positive('Tour ID phai hop le'),
  rating: z.number()
    .min(1, 'Danh gia phai tu 1 sao')
    .max(5, 'Danh gia toi da 5 sao'),
  comment: z.string()
    .min(10, 'Binh luan phai tu 10 ky tu')
    .max(1000, 'Binh luan qua dai'),
});

// Customer validation schema (cho admin tao customer)
export const customerSchema = z.object({
  full_name: z.string()
    .min(2, 'Ho ten phai tu 2 ky tu')
    .max(100, 'Ho ten qua dai'),
  phone_number: z.string()
    .regex(/^[0-9]{10,11}$/, 'So dien thoai phai tu 10-11 so'),
  email: z.string()
    .email('Email khong dung dinh dang'),
  address: z.string()
    .max(255, 'Dia chi qua dai')
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
    }, 'Ngay sinh khong hop le'),
});

// Role validation schema (cho admin)
export const roleSchema = z.object({
  role_name: z.string()
    .min(2, 'Ten role phai tu 2 ky tu')
    .max(50, 'Ten role qua dai'),
  description: z.string()
    .max(200, 'Mo ta qua dai'),
  permissions: z.string()
    .optional(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TourInput = z.infer<typeof tourSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type RoleInput = z.infer<typeof roleSchema>;