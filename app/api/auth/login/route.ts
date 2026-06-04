import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { loginSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationHandler } from '@/lib/api-validation';
import { AuthService } from '@/lib/services/auth-service';
import { ErrorHandler } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input using centralized validation handler
    const validationResult = ValidationHandler.validateOrErrorResponse(loginSchema, body);
    if (validationResult) {
      return validationResult;
    }

    const validatedData = ValidationHandler.validateOrThrow(loginSchema, body);
    
    // Call AuthService for business logic
    const result = await AuthService.login(validatedData);

    // Save token to cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', result.clientToken, {
      maxAge: 86400, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return successResponse(result, 'Đăng nhập thành công');

  } catch (error) {
    console.error('Login error:', error);
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}
