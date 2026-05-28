import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AuthService } from '@/lib/services/auth-service';
import { CustomerService } from '@/lib/services/customer-service';
import { ErrorHandler } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
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
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    
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
      identity_card: body.identity_card
    });

    return successResponse({}, 'Cập nhật thông tin thành công');
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError, 'Error updating customer profile');
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

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
}
