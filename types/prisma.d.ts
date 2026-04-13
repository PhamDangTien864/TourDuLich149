// Temporary type definitions for Prisma models
// This file should be removed after running `npx prisma generate`

export interface Review {
  id: number;
  tour_id: number;
  account_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
  is_deleted: boolean;
  account?: {
    id: number;
    full_name: string;
  };
}

export interface Tour {
  id: number;
  title: string;
  location_name: string;
  price: bigint;
  category_id: number;
  description?: string;
  sub_title?: string;
  is_active: boolean;
  is_deleted: boolean;
  category?: {
    id: number;
    category_name: string;
  };
}

export interface Account {
  id: number;
  full_name: string;
  username: string;
  role_id: number;
  phone_number: string;
  is_deleted: boolean;
}

export interface Booking {
  id: number;
  customer_id: number;
  tour_id: number;
  account_id: number;
  start_date: Date;
  end_date: Date;
  total_amount: bigint;
  paid_amount: bigint;
  is_confirmed: boolean;
  customer?: {
    id: number;
    full_name: string;
    identity_card: string;
    phone_number: string;
    address?: string;
    birth_date: Date;
  };
  tour?: Tour;
}
