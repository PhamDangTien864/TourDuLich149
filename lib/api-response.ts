import { NextResponse } from 'next/server';
import { BookingError, ErrorHandler } from './errors';

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  details?: any;
}

// Success response helper
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    statusCode
  };
  
  return NextResponse.json(response, { status: statusCode });
}

// Error response helper
export function errorResponse(
  error: string | BookingError,
  statusCode: number = 500,
  details?: any
): NextResponse<ApiResponse> {
  let errorMessage: string;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = error.message;
    statusCode = error.statusCode || statusCode;
    details = error.details;
  }
  
  const response: ApiResponse = {
    success: false,
    error: errorMessage,
    ...(details && { details }),
    statusCode
  };
  
  return NextResponse.json(response, { status: statusCode });
}

// Validation error response helper
export function validationErrorResponse(
  errors: string[] | Record<string, string>,
  message: string = 'Dữ liệu không hợp lệ'
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: message,
    details: errors,
    statusCode: 400
  };
  
  return NextResponse.json(response, { status: 400 });
}

// Unauthorized response helper
export function unauthorizedResponse(
  message: string = 'Bạn cần đăng nhập để thực hiện hành động này'
): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

// Forbidden response helper
export function forbiddenResponse(
  message: string = 'Bạn không có quyền thực hiện hành động này'
): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

// Not found response helper
export function notFoundResponse(
  message: string = 'Không tìm thấy tài nguyên'
): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

// Conflict response helper
export function conflictResponse(
  message: string = 'Xung đột dữ liệu'
): NextResponse<ApiResponse> {
  return errorResponse(message, 409);
}

// Async handler wrapper for consistent error handling
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch((error) => {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    
    return errorResponse(bookingError, bookingError.statusCode);
  });
}

// Request handler wrapper with validation
export async function withValidation<T>(
  schema: any,
  data: any,
  handler: (validatedData: T) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const validatedData = schema.parse(data);
    return await handler(validatedData);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const errors = error.errors.map((e: any) => e.message);
      return validationErrorResponse(errors);
    }
    return errorResponse('Lỗi validation', 400);
  }
}
