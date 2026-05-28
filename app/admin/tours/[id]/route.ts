import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse } from '@/lib/api-response';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // SỬA: Đổi thành Promise
) {
  try {
    const resolvedParams = await params; // Bây giờ await mới hợp lệ
    const tourId = parseInt(resolvedParams.id);
    
    if (isNaN(tourId)) {
      return NextResponse.json({ error: "Invalid tour ID" }, { status: 400 });
    }

    // Soft delete: set is_deleted = true
    const deletedTour = await prisma.tours.update({
      where: { id: tourId },
      data: { is_deleted: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Tour deleted successfully",
      tour: deletedTour 
    });

  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError, 'DELETE_TOUR_ERROR');
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}