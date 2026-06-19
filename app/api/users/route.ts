import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse, successResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  return requireRole([1])(async (request) => {
    try {
      const body = await req.json();
      const { username, full_name, email, phone_number, password, role_id } = body;

      // Validate required fields
      if (!username || !full_name || !email || !phone_number || !password) {
        return errorResponse('Thiếu thông tin bắt buộc', 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return errorResponse('Email không đúng định dạng', 400);
      }

      // Validate phone format
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone_number)) {
        return errorResponse('Số điện thoại phải 10 số', 400);
      }

      // Validate role_id
      if (role_id !== 1 && role_id !== 2) {
        return errorResponse('Role_id phải là 1 (Admin) hoặc 2 (User)', 400);
      }

      // Check for duplicate email
      const existingEmail = await prisma.accounts.findFirst({
        where: {
          email: email,
          is_deleted: false
        }
      });

      if (existingEmail) {
        return errorResponse('Email này đã được sử dụng', 400);
      }

      // Check for duplicate phone
      const existingPhone = await prisma.accounts.findFirst({
        where: {
          phone_number: phone_number,
          is_deleted: false
        }
      });

      if (existingPhone) {
        return errorResponse('Số điện thoại này đã được sử dụng', 400);
      }

      // Check for duplicate username
      const existingUsername = await prisma.accounts.findFirst({
        where: {
          username: username,
          is_deleted: false
        }
      });

      if (existingUsername) {
        return errorResponse('Tên đăng nhập này đã được sử dụng', 400);
      }

      // Create user
      const newUser = await prisma.accounts.create({
        data: {
          username,
          full_name,
          email,
          phone_number,
          password, // Note: In production, this should be hashed
          role_id: role_id || 2,
          is_verified: true
        },
        select: {
          id: true,
          username: true,
          full_name: true,
          email: true,
          phone_number: true,
          role_id: true,
          is_verified: true
        }
      });

      return successResponse(newUser, 'Tạo user thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'CREATE_USER_ERROR');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}
