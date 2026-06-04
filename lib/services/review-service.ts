import { prisma } from '@/lib/prisma';
import { ValidationError, AuthenticationError } from '@/lib/errors';

export interface CreateReviewData {
  tour_id: number;
  rating: number;
  comment?: string;
  images?: string;
}

export interface ReviewWithUser {
  id: number;
  tour_id: number;
  account_id: number;
  rating: number | null;
  comment: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  accounts: {
    id: number;
    full_name: string;
  };
}

export interface ReviewsWithStats {
  reviews: ReviewWithUser[];
  averageRating: number;
  totalReviews: number;
}

export class ReviewService {
  /**
   * Get reviews for a tour with statistics
   * Extracts business logic from reviews API route
   */
  static async getReviewsByTour(tourId: number): Promise<ReviewsWithStats> {
    const reviews = await prisma.reviews.findMany({
      where: {
        tour_id: tourId,
        is_deleted: false
      },
      include: {
        accounts: {
          select: {
            id: true,
            full_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Calculate average rating
    const validRatings = reviews.filter(r => r.rating !== null).map(r => r.rating as number);
    const avgRating = validRatings.length > 0 
      ? validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length 
      : 0;

    return {
      reviews: reviews as ReviewWithUser[],
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    };
  }

  /**
   * Create a new review
   * Extracts business logic from reviews API route
   */
  static async createReview(userId: number, data: CreateReviewData): Promise<ReviewWithUser> {
    const { tour_id, rating, comment, images } = data;

    // Check if user already reviewed this tour
    const existingReview = await prisma.reviews.findFirst({
      where: {
        tour_id: tour_id,
        account_id: userId,
        is_deleted: false
      }
    });

    if (existingReview) {
      throw new ValidationError(['Bạn đã đánh giá tour này rồi']);
    }

    // Check if user has completed a booking for this tour
    const completedBooking = await prisma.bookings.findFirst({
      where: {
        tour_id: tour_id,
        account_id: userId,
        status: 'COMPLETED', // Only allow reviews for completed tours
        is_deleted: false,
        end_date: {
          lt: new Date() // Tour must have ended
        }
      }
    });

    if (!completedBooking) {
      throw new AuthenticationError('Bạn chưa đi tour này nên không thể đánh giá');
    }

    // Create review
    const review = await prisma.reviews.create({
      data: {
        tour_id: tour_id,
        account_id: userId,
        rating,
        comment,
      },
      include: {
        accounts: {
          select: {
            id: true,
            full_name: true
          }
        }
      }
    });

    return review as ReviewWithUser;
  }

  /**
   * Update a review
   */
  static async updateReview(reviewId: number, userId: number, data: Partial<CreateReviewData>): Promise<ReviewWithUser> {
    // Check if review exists and belongs to user
    const review = await prisma.reviews.findFirst({
      where: {
        id: reviewId,
        account_id: userId,
        is_deleted: false
      }
    });

    if (!review) {
      throw new AuthenticationError('Đánh giá không tồn tại hoặc bạn không có quyền sửa');
    }

    // Update review
    const updatedReview = await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.comment !== undefined && { comment: data.comment })
      },
      include: {
        accounts: {
          select: {
            id: true,
            full_name: true
          }
        }
      }
    });

    return updatedReview as ReviewWithUser;
  }

  /**
   * Delete a review (soft delete)
   */
  static async deleteReview(reviewId: number, userId: number): Promise<void> {
    // Check if review exists and belongs to user
    const review = await prisma.reviews.findFirst({
      where: {
        id: reviewId,
        account_id: userId,
        is_deleted: false
      }
    });

    if (!review) {
      throw new AuthenticationError('Đánh giá không tồn tại hoặc bạn không có quyền xóa');
    }

    await prisma.reviews.update({
      where: { id: reviewId },
      data: { is_deleted: true }
    });
  }

  /**
   * Get reviews by user
   */
  static async getReviewsByUser(userId: number): Promise<ReviewWithUser[]> {
    const reviews = await prisma.reviews.findMany({
      where: {
        account_id: userId,
        is_deleted: false
      },
      include: {
        accounts: {
          select: {
            id: true,
            full_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return reviews as ReviewWithUser[];
  }
}
