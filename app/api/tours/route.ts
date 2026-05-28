import { NextRequest } from 'next/server';
import { tourSchema } from '@/lib/validations';
import { TourService, TourFilters } from '@/lib/services/tour-service';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { ValidationHandler } from '@/lib/api-validation';
import { ErrorHandler } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Build filters object
    const filters: TourFilters = {
      category: searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined,
      location: searchParams.get('location') || undefined,
      q: searchParams.get('q') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10')
    };

    const result = await TourService.getTours(filters);
    
    // Add caching headers for GET requests
    const response = successResponse(result);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input using centralized validation handler
    const validationResult = ValidationHandler.validateOrErrorResponse(tourSchema, body);
    if (validationResult) {
      return validationResult;
    }

    const validatedData = ValidationHandler.validateOrThrow(tourSchema, body);
    
    const tour = await TourService.createTour(validatedData);

    return successResponse({ tour }, 'Tour được tạo thành công');
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}