import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse, successResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/middleware';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireRole([1])(async (request) => {
    try {
      const resolvedParams = await params;
      const tourId = parseInt(resolvedParams.id);

      if (isNaN(tourId)) {
        return errorResponse("Invalid tour ID", 400);
      }

      // Soft delete: set is_deleted = true
      const deletedTour = await prisma.tours.update({
        where: { id: tourId },
        data: { is_deleted: true }
      });

      return successResponse({
        tour: deletedTour
      }, "Tour deleted successfully");

    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'DELETE_TOUR_ERROR');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}