import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AuthService } from '@/lib/services/auth-service';
import { ErrorHandler } from '@/lib/errors';
import { requireAuth } from '@/lib/middleware';

export async function POST(req) {
  return requireAuth(async (request) => {
    try {
      const body = await req.json();
      const { userId, currentPassword, newPassword, emailVerification } = await body;

      // Users can only change their own password unless they are admin
      if (request.user.role_id !== 1 && request.user.id !== parseInt(userId)) {
        return errorResponse('Bạn không có quyền đổi mật khẩu của người khác', 403);
      }

      if (!userId) {
        return errorResponse('Thiếu thông tin người dùng', 400);
      }

      // Method 1: Verify with current password
      if (currentPassword) {
        await AuthService.changePassword(parseInt(userId), currentPassword, newPassword);
      }
      // Method 2: Verify with email (not implemented in AuthService, keeping original logic)
      else if (emailVerification) {
        // This would need to be added to AuthService if needed
        // For now, keeping original logic
        return errorResponse('Phương thức xác thực qua email chưa được hỗ trợ', 400);
      }
      else {
        return errorResponse('Cần xác nhận mật khẩu hiện tại hoặc email', 400);
      }

      return successResponse({}, 'Đổi mật khẩu thành công');
    } catch (error) {
      console.error('Error changing password:', error);
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError);

      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}
