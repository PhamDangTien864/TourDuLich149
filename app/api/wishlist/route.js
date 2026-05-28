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