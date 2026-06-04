import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.tour_categories.findMany({
      select: {
        id: true,
        category_name: true,
        note: true
      },
      orderBy: {
        category_name: 'asc'
      }
    });

    return successResponse(categories);
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError, 'GET_CATEGORIES_ERROR');
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}
