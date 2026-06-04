import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AuthService } from '@/lib/services/auth-service';
import { CustomerService } from '@/lib/services/customer-service';
import { ErrorHandler } from '@/lib/errors';
import { requireAuth } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (req) => {
    try {
      const { id } = await params;
      const userId = parseInt(id);

      // Users can only view their own profile unless they are admin
      if (req.user!.role_id !== 1 && req.user!.id !== userId) {
        return errorResponse('Bạn không có quyền xem thông tin người khác', 403);
      }

      if (isNaN(userId)) {
        return errorResponse('Invalid user ID', 400);
      }

      const user = await AuthService.getUserById(userId);
      const customer = await CustomerService.getCustomerByPhone(user.phone_number);

      return successResponse({
        ...user,
        identity_card: customer?.identity_card || '',
        address: customer?.address || ''
      });
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'Error fetching customer details');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(request);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (req) => {
    try {
      const { id } = await params;
      const userId = parseInt(id);
      const body = await request.json();

      // Users can only update their own profile unless they are admin
      if (req.user!.role_id !== 1 && req.user!.id !== userId) {
        return errorResponse('Bạn không có quyền cập nhật thông tin người khác', 403);
      }

      if (isNaN(userId)) {
        return errorResponse('Invalid user ID', 400);
      }

      // Update user profile
      await AuthService.updateProfile(userId, {
        full_name: body.full_name,
        phone_number: body.phone_number,
        avatar_url: body.avatar_url
      });

      // Update or create customer record
      await CustomerService.createOrUpdateCustomer({
        full_name: body.full_name,
        phone_number: body.phone_number,
        email: body.email,
        address: body.address,
        birth_date: body.birth_date ? new Date(body.birth_date) : undefined,
        identity_card: body.identity_card,
        province_id: body.province_id ? Number(body.province_id) : undefined,
        district_id: body.district_id ? Number(body.district_id) : undefined,
        ward_id: body.ward_id ? Number(body.ward_id) : undefined
      });

      return successResponse({}, 'Cập nhật thông tin thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'Error updating customer profile');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (req) => {
    try {
      const { id } = await params;
      const userId = parseInt(id);

      // Only admins can delete users
      if (req.user!.role_id !== 1) {
        return errorResponse('Bạn không có quyền xóa người dùng', 403);
      }

      if (isNaN(userId)) {
        return errorResponse('Invalid user ID', 400);
      }

      // Soft delete customer
      await CustomerService.deleteCustomer(userId);

      return successResponse({}, 'Xóa khách hàng thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'Error deleting customer');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(request);
}
