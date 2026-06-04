import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse, successResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tourId = parseInt(resolvedParams.id);

    if (isNaN(tourId)) {
      return errorResponse('Invalid tour ID', 400);
    }

    const tour = await prisma.tours.findUnique({
      where: { id: tourId, is_deleted: false },
      include: {
        tour_images: true
      }
    });

    if (!tour) {
      return errorResponse('Tour not found', 404);
    }

    // Convert BigInt to Number for JSON serialization
    const serializedTour = {
      ...tour,
      price: Number(tour.price),
      max_slots: Number(tour.max_slots),
      duration_days: Number(tour.duration_days),
      min_age: Number(tour.min_age),
      max_age: tour.max_age ? Number(tour.max_age) : null
    };

    return successResponse(serializedTour);
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError, 'GET_TOUR_ERROR');
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireRole([1])(async (request) => {
    try {
      const resolvedParams = await params;
      const tourId = parseInt(resolvedParams.id);
      const body = await req.json();

      if (isNaN(tourId)) {
        return errorResponse('Invalid tour ID', 400);
      }

      const updatedTour = await prisma.tours.update({
        where: { id: tourId },
        data: {
          title: body.title,
          location_name: body.location_name,
          price: body.price,
          category_id: body.category_id,
          description: body.description,
          max_slots: body.max_slots,
          is_active: body.is_active
        },
        include: {
          tour_images: true
        }
      });

      return successResponse(updatedTour, 'Cập nhật tour thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'PATCH_TOUR_ERROR');
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
      const tourId = parseInt(resolvedParams.id);

      if (isNaN(tourId)) {
        return errorResponse('Invalid tour ID', 400);
      }

      // Soft delete: set is_deleted = true
      const deletedTour = await prisma.tours.update({
        where: { id: tourId },
        data: { is_deleted: true }
      });

      return successResponse({
        tour: deletedTour
      }, 'Xóa tour thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'DELETE_TOUR_ERROR');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}
