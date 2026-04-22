import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { reviewSchema } from '@/lib/validations';
import type { Review } from '@/types/prisma';

const prismaTyped = prisma;

// GET all reviews for a tour
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tourId = searchParams.get('tour_id');

    if (!tourId) {
      return NextResponse.json({ error: 'Tour ID is required' }, { status: 400 });
    }

    const reviews = await prismaTyped.reviews.findMany({
      where: {
        tour_id: parseInt(tourId),
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

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new review
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Validate input
    const body = await req.json();
    const validatedData = reviewSchema.parse(body);
    
    const { tour_id, rating, comment } = validatedData;

    // Check if user already reviewed this tour
    const existingReview = await prismaTyped.reviews.findFirst({
      where: {
        tour_id: Number(tour_id),
        account_id: user.id,
        is_deleted: false
      }
    });

    // Create review
    const review = await prismaTyped.reviews.create({
      data: {
        tour_id: Number(tour_id),
        account_id: user.id,
        rating,
        comment
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

    return NextResponse.json({ 
      success: true, 
      review 
    });
  } catch (error) {
    console.error('Create review error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
