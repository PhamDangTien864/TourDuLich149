import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { reviewSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationHandler } from '@/lib/api-validation';
import { ReviewService } from '@/lib/services/review-service';
import { ErrorHandler } from '@/lib/errors';

// GET all reviews for a tour
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tourId = searchParams.get('tour_id');

    if (!tourId) {
      return errorResponse('Tour ID is required', 400);
    }

    const result = await ReviewService.getReviewsByTour(parseInt(tourId));
    
    return successResponse(result);
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}

// POST create a new review
export async function POST(req: NextRequest) {
  return requireAuth(async (request) => {
    try {
      const user = request.user;
      const body = await request.json();
      
      // Validate input using centralized validation handler
      const validationResult = ValidationHandler.validateOrErrorResponse(reviewSchema, body);
      if (validationResult) {
        return validationResult;
      }

      const validatedData = ValidationHandler.validateOrThrow(reviewSchema, body);
      
      // Call ReviewService for business logic
      const review = await ReviewService.createReview(user!.id, validatedData);

      return successResponse({ review }, 'Đánh giá thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError);
      
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}
