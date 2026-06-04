import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse, successResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/middleware';

// GET - Fetch user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireRole([1])(async (request) => {
    try {
      const resolvedParams = await params;
      const userId = parseInt(resolvedParams.id);
      
      if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
      }

      const user = await prisma.accounts.findUnique({
        where: {
          id: userId,
          is_deleted: false
        },
        select: {
          id: true,
          full_name: true,
          username: true,
          email: true,
          phone_number: true,
          role_id: true,
          is_deleted: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'GET_USER_ERROR');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireRole([1])(async (request) => {
    try {
      const resolvedParams = await params;
      const userId = parseInt(resolvedParams.id);

      if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
      }

      // Prevent self-deletion
      if (request.user?.id === userId) {
        return NextResponse.json({ 
          error: "Bạn không thể xóa chính mình" 
        }, { status: 403 });
      }

      // Prevent deletion of admin users (role_id = 1)
      const userToDelete = await prisma.accounts.findUnique({
        where: { id: userId }
      });

      if (!userToDelete) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (userToDelete.role_id === 1) {
        return NextResponse.json({ 
          error: "Không thể xóa tài khoản Admin" 
        }, { status: 403 });
      }

      // Soft delete: set is_deleted = true
      const deletedUser = await prisma.accounts.update({
        where: { id: userId },
        data: { is_deleted: true },
        select: {
          id: true,
          full_name: true,
          username: true,
          email: true,
          phone_number: true,
          role_id: true,
          is_deleted: true,
          created_at: true,
          updated_at: true
        }
      });

      return successResponse({
        user: deletedUser
      }, 'User deleted successfully');

    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'DELETE_USER_ERROR');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireRole([1])(async (request) => {
    try {
      const resolvedParams = await params;
      const userId = parseInt(resolvedParams.id);

      if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
      }

      const body = await req.json();
      const { full_name, email, phone_number, birth_date, role_id, is_verified } = body;

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return NextResponse.json({ 
            error: "Email không đúng định dạng" 
          }, { status: 400 });
        }
      }

      // Validate phone format if provided
      if (phone_number) {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone_number)) {
          return NextResponse.json({ 
            error: "Số điện thoại phải từ 10-11 số" 
          }, { status: 400 });
        }
      }

      // Validate birth date if provided
      if (birth_date) {
        const parsedDate = new Date(birth_date);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ 
            error: "Ngày sinh không hợp lệ" 
          }, { status: 400 });
        }
        // Check if birth date is not in the future
        if (parsedDate > new Date()) {
          return NextResponse.json({ 
            error: "Ngày sinh không thể là ngày trong tương lai" 
          }, { status: 400 });
        }
      }

      // Validate role_id if provided
      if (role_id !== undefined) {
        if (role_id !== 1 && role_id !== 2) {
          return NextResponse.json({ 
            error: "Role_id phải là 1 (Admin) hoặc 2 (User)" 
          }, { status: 400 });
        }
      }

      // Get current user
      const currentUser = await prisma.accounts.findUnique({
        where: { id: userId }
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Prevent self-role change to avoid locking yourself out
      if (request.user?.id === userId && role_id !== undefined && role_id !== currentUser.role_id) {
        return NextResponse.json({ 
          error: "Bạn không thể thay đổi vai trò của chính mình" 
        }, { status: 403 });
      }

      // Check for duplicate email if email is being changed
      if (email && email !== currentUser.email) {
        const existingUser = await prisma.accounts.findFirst({
          where: {
            email: email,
            is_deleted: false,
            NOT: { id: userId }
          }
        });

        if (existingUser) {
          return NextResponse.json({ 
            error: "Email này đã được sử dụng bởi user khác" 
          }, { status: 400 });
        }
      }

      // Check for duplicate phone number if phone is being changed
      if (phone_number && phone_number !== currentUser.phone_number) {
        const existingUser = await prisma.accounts.findFirst({
          where: {
            phone_number: phone_number,
            is_deleted: false,
            NOT: { id: userId }
          }
        });

        if (existingUser) {
          return NextResponse.json({ 
            error: "Số điện thoại này đã được sử dụng bởi user khác" 
          }, { status: 400 });
        }
      }

      // Update user with new data
      const updatedUser = await prisma.accounts.update({
        where: { id: userId },
        data: {
          full_name: full_name || currentUser.full_name,
          email: email || currentUser.email,
          phone_number: phone_number || currentUser.phone_number,
          birth_date: birth_date ? new Date(birth_date) : currentUser.birth_date,
          role_id: role_id !== undefined ? role_id : currentUser.role_id,
          is_verified: is_verified !== undefined ? is_verified : currentUser.is_verified
        }
      });

      return successResponse({ 
        user: updatedUser 
      }, 'User updated successfully');

    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'PATCH_USER_ERROR');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}
