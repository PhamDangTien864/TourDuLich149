import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
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
    console.error("DELETE_TOUR_ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to delete tour" 
    }, { status: 500 });
  }
}
