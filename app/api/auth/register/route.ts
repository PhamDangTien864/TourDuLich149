import { NextRequest } from 'next/server';
import { registerSchema } from "@/lib/validations";
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationHandler } from '@/lib/api-validation';
import { AuthService } from '@/lib/services/auth-service';
import { ErrorHandler } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input using centralized validation handler
    const validationResult = ValidationHandler.validateOrErrorResponse(registerSchema, body);
    if (validationResult) {
      return validationResult;
    }

    const validatedData = ValidationHandler.validateOrThrow(registerSchema, body);
    
    // Call AuthService for business logic
    const result = await AuthService.register(validatedData);

    return successResponse(result, 'Check email để xác thực nhé!');

  } catch (error) {
    console.error('Register API error:', error);
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}