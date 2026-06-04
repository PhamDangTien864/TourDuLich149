import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse } from '@/lib/api-response';
import { WishlistService } from '@/lib/services/wishlist-service';
import { ErrorHandler } from '@/lib/errors';

export async function GET(req) {
  return requireAuth(async (request) => {
    try {
      const user = request.user;

      const items = await WishlistService.getWishlistByUserId(user.id);

      return successResponse({ wishlist: items });
    } catch (error) {
      console.error('Get wishlist error:', error);
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError);

      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}

export async function POST(req) {
  return requireAuth(async (request) => {
    try {
      const user = request.user;
      const body = await request.json();
      const { tourId } = body;

      if (!tourId) {
        return errorResponse('Tour ID is required', 400);
      }

      const item = await WishlistService.addToWishlist(user.id, tourId);

      return successResponse({ item }, 'Tour added to wishlist');
    } catch (error) {
      console.error('Add to wishlist error:', error);
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError);

      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}

export async function DELETE(req) {
  return requireAuth(async (request) => {
    try {
      const user = request.user;
      const body = await request.json();
      const { tourId } = body;

      if (!tourId) {
        return errorResponse('Tour ID is required', 400);
      }

      await WishlistService.removeFromWishlist(user.id, tourId);

      return successResponse(null, 'Tour removed from wishlist');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError);

      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}