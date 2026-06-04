import { prisma } from '@/lib/prisma';
import { TourNotFoundError, DuplicateBookingError, BookingError } from '@/lib/errors';

export interface WishlistItem {
  id: number;
  account_id: number;
  tour_id: number;
  created_at: Date;
  tours: {
    id: number;
    title: string;
    location_name: string | null;
    price: bigint;
    tour_images: Array<{
      image_url: string;
    }>;
  };
}

export class WishlistService {
  /**
   * Get wishlist items for a user
   * Extracts business logic from wishlist API route
   */
  static async getWishlistByUserId(userId: number): Promise<WishlistItem[]> {
    const items = await prisma.wishlist.findMany({
      where: { account_id: userId },
      include: { 
        tours: {
          include: {
            tour_images: {
              take: 1
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return items as WishlistItem[];
  }

  /**
   * Add tour to wishlist
   */
  static async addToWishlist(userId: number, tourId: number): Promise<WishlistItem> {
    // Check if tour exists
    const tour = await prisma.tours.findUnique({
      where: { id: tourId, is_deleted: false }
    });

    if (!tour) {
      throw new TourNotFoundError(tourId);
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: {
        account_id: userId,
        tour_id: tourId
      }
    });

    if (existing) {
      throw new DuplicateBookingError({ tourId });
    }

    // Add to wishlist
    const item = await prisma.wishlist.create({
      data: {
        account_id: userId,
        tour_id: tourId
      },
      include: {
        tours: {
          include: {
            tour_images: {
              take: 1
            }
          }
        }
      }
    });

    return item as WishlistItem;
  }

  /**
   * Remove tour from wishlist
   */
  static async removeFromWishlist(userId: number, tourId: number): Promise<void> {
    // Check if item exists and belongs to user
    const item = await prisma.wishlist.findFirst({
      where: {
        account_id: userId,
        tour_id: tourId
      }
    });

    if (!item) {
      throw new BookingError('WISHLIST_ITEM_NOT_FOUND', 'Tour không có trong wishlist', { tourId }, 404);
    }

    await prisma.wishlist.delete({
      where: { id: item.id }
    });
  }

  /**
   * Check if tour is in user's wishlist
   */
  static async isInWishlist(userId: number, tourId: number): Promise<boolean> {
    const item = await prisma.wishlist.findFirst({
      where: {
        account_id: userId,
        tour_id: tourId
      }
    });

    return !!item;
  }

  /**
   * Clear user's wishlist
   */
  static async clearWishlist(userId: number): Promise<void> {
    await prisma.wishlist.deleteMany({
      where: { account_id: userId }
    });
  }
}
