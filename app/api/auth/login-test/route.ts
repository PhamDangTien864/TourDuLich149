import { NextRequest, NextResponse } from 'next/server';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Simple test response
    return NextResponse.json({ 
      success: true, 
      message: "Login test API working!",
      received: body 
    });
    
  } catch (error: unknown) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}
