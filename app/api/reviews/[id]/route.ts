import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse, successResponse } from '@/lib/api-response';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const reviewId = parseInt(resolvedParams.id);

    if (isNaN(reviewId)) {
      return errorResponse('Invalid review ID', 400);
    }

    const review = await prisma.reviews.findUnique({
      where: { id: reviewId },
      include: {
        accounts: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        },
        tours: {
          select: {
            id: true,
            title: true,
            location_name: true
          }
        }
      }
    });

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    return successResponse(review);
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError, 'GET_REVIEW_ERROR');
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (request) => {
    try {
      const resolvedParams = await params;
      const reviewId = parseInt(resolvedParams.id);
      const body = await req.json();
      const { rating, comment, images } = body;

      if (isNaN(reviewId)) {
        return errorResponse('Invalid review ID', 400);
      }

      // Check if review exists and belongs to user
      const existingReview = await prisma.reviews.findUnique({
        where: { id: reviewId }
      });

      if (!existingReview) {
        return errorResponse('Review not found', 404);
      }

      // Only review owner or admin can update
      if (request.user!.role_id !== 1 && existingReview.account_id !== request.user!.id) {
        return errorResponse('Bạn không có quyền sửa review này', 403);
      }

      const updatedReview = await prisma.reviews.update({
        where: { id: reviewId },
        data: {
          ...(rating !== undefined && { rating }),
          ...(comment !== undefined && { comment }),
          ...(images !== undefined && { images })
        },
        include: {
          accounts: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          },
          tours: {
            select: {
              id: true,
              title: true,
              location_name: true
            }
          }
        }
      });

      return successResponse(updatedReview, 'Cập nhật review thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'PATCH_REVIEW_ERROR');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (request) => {
    try {
      const resolvedParams = await params;
      const reviewId = parseInt(resolvedParams.id);

      if (isNaN(reviewId)) {
        return errorResponse('Invalid review ID', 400);
      }

      // Check if review exists and belongs to user
      const existingReview = await prisma.reviews.findUnique({
        where: { id: reviewId }
      });

      if (!existingReview) {
        return errorResponse('Review not found', 404);
      }

      // Only review owner or admin can delete
      if (request.user!.role_id !== 1 && existingReview.account_id !== request.user!.id) {
        return errorResponse('Bạn không có quyền xóa review này', 403);
      }

      await prisma.reviews.delete({
        where: { id: reviewId }
      });

      return successResponse({}, 'Xóa review thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError, 'DELETE_REVIEW_ERROR');
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}
