import { prisma } from '@/lib/prisma';
import { AuthenticationError, ValidationError } from '@/lib/errors';

export interface CustomerData {
  full_name: string;
  phone_number: string;
  email?: string;
  address?: string;
  birth_date?: Date;
  is_male?: boolean;
  identity_card?: string;
  province_id?: number;
  district_id?: number;
  ward_id?: number;
}

export interface BookingWithCustomer {
  id: number;
  customer_id: number;
  tour_id: number;
  start_date: Date;
  end_date: Date;
  total_amount: bigint;
  paid_amount: bigint;
  status: string;
  is_confirmed: boolean;
  customers: {
    full_name: string;
    phone_number: string;
  };
  tours: {
    title: string;
    location_name: string | null;
    tour_images: Array<{
      image_url: string;
    }>;
  };
}

export class CustomerService {
  /**
   * Get customer by ID
   */
  static async getCustomerById(customerId: number): Promise<any> {
    const customer = await prisma.customers.findUnique({
      where: { id: customerId, is_deleted: false }
    });

    if (!customer) {
      throw new AuthenticationError('Khách hàng không tồn tại');
    }

    return customer;
  }

  /**
   * Get customer by phone number
   */
  static async getCustomerByPhone(phoneNumber: string): Promise<any> {
    const customer = await prisma.customers.findFirst({
      where: { 
        phone_number: phoneNumber,
        is_deleted: false 
      }
    });

    return customer;
  }

  /**
   * Create or update customer
   * Extracts business logic from booking service
   */
  static async createOrUpdateCustomer(data: CustomerData): Promise<any> {
    let customer = await prisma.customers.findFirst({
      where: { phone_number: data.phone_number, is_deleted: false }
    });

    if (!customer) {
      customer = await prisma.customers.create({
        data: {
          full_name: data.full_name,
          phone_number: data.phone_number,
          email: data.email || null,
          address: data.address || null,
          birth_date: data.birth_date || null,
          is_male: data.is_male ?? true,
          identity_card: data.identity_card || null,
          province_id: data.province_id || null,
          district_id: data.district_id || null,
          ward_id: data.ward_id || null,
          is_deleted: false
        }
      });
    } else {
      customer = await prisma.customers.update({
        where: { id: customer.id },
        data: { 
          full_name: data.full_name,
          ...(data.email && { email: data.email }),
          ...(data.address && { address: data.address }),
          ...(data.birth_date && { birth_date: data.birth_date }),
          ...(data.identity_card && { identity_card: data.identity_card }),
          ...(data.province_id !== undefined && { province_id: data.province_id }),
          ...(data.district_id !== undefined && { district_id: data.district_id }),
          ...(data.ward_id !== undefined && { ward_id: data.ward_id })
        }
      });
    }

    return customer;
  }

  /**
   * Update customer
   */
  static async updateCustomer(customerId: number, data: Partial<CustomerData>): Promise<any> {
    const customer = await prisma.customers.findUnique({
      where: { id: customerId, is_deleted: false }
    });

    if (!customer) {
      throw new AuthenticationError('Khách hàng không tồn tại');
    }

    const updatedCustomer = await prisma.customers.update({
      where: { id: customerId },
      data: {
        ...(data.full_name && { full_name: data.full_name }),
        ...(data.phone_number && { phone_number: data.phone_number }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.birth_date !== undefined && { birth_date: data.birth_date }),
        ...(data.is_male !== undefined && { is_male: data.is_male }),
        ...(data.identity_card !== undefined && { identity_card: data.identity_card }),
        ...(data.province_id !== undefined && { province_id: data.province_id }),
        ...(data.district_id !== undefined && { district_id: data.district_id }),
        ...(data.ward_id !== undefined && { ward_id: data.ward_id })
      }
    });

    return updatedCustomer;
  }

  /**
   * Delete customer (soft delete)
   */
  static async deleteCustomer(customerId: number): Promise<void> {
    const customer = await prisma.customers.findUnique({
      where: { id: customerId, is_deleted: false }
    });

    if (!customer) {
      throw new AuthenticationError('Khách hàng không tồn tại');
    }

    await prisma.customers.update({
      where: { id: customerId },
      data: { is_deleted: true }
    });
  }

  /**
   * Get bookings for a customer
   */
  static async getCustomerBookings(customerId: number): Promise<BookingWithCustomer[]> {
    const bookings = await prisma.bookings.findMany({
      where: {
        customer_id: customerId,
        is_deleted: false
      },
      include: {
        customers: {
          select: {
            full_name: true,
            phone_number: true
          }
        },
        tours: {
          select: {
            title: true,
            location_name: true,
            tour_images: {
              take: 1
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    return bookings as BookingWithCustomer[];
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(customerId: number): Promise<any> {
    const [totalBookings, completedBookings, cancelledBookings] = await Promise.all([
      prisma.bookings.count({
        where: { customer_id: customerId, is_deleted: false }
      }),
      prisma.bookings.count({
        where: { 
          customer_id: customerId, 
          is_deleted: false,
          status: 'COMPLETED'
        }
      }),
      prisma.bookings.count({
        where: { 
          customer_id: customerId, 
          is_deleted: false,
          status: 'CANCELLED'
        }
      })
    ]);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      activeBookings: totalBookings - completedBookings - cancelledBookings
    };
  }
}
