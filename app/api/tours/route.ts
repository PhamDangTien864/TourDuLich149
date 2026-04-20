import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { tourSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { cache, CACHE_KEYS } from '@/lib/cache';

// GET all tours with caching
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    logger.apiRequest('GET', '/api/tours', undefined);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Create cache key based on filters
    const cacheKey = `${CACHE_KEYS.TOURS}:${JSON.stringify({ category, location, minPrice, maxPrice, page, limit })}`;

    // Try to get from cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Tours served from cache', { cacheKey }, undefined, requestId);
      return NextResponse.json(cached);
    }

    // Build where clause for filtering
    const where: any = {
      is_active: true,
      is_deleted: false
    };

    if (category) {
      where.category_id = parseInt(category);
    }

    if (location) {
      where.location_name = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = BigInt(parseInt(minPrice));
      if (maxPrice) where.price.lte = BigInt(parseInt(maxPrice));
    }

    // Get total count for pagination
    const total = await prisma.tours.count({ where });

    // Get tours with pagination
    const tours = await prisma.tours.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            category_name: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format response
    const toursFormatted = tours.map(tour => ({
      ...tour,
      price: tour.price.toString(),
      averageRating: 0, // TODO: Calculate from reviews table
      totalReviews: 0, // TODO: Count from reviews table
      totalBookings: 0 // TODO: Count from bookings table
    }));

    const response = {
      tours: toursFormatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, response, 5 * 60 * 1000);

    logger.info(`Tours retrieved in ${Date.now() - startTime}ms`, { 
      count: tours.length, 
      cacheKey 
    }, undefined, requestId);

    return NextResponse.json(response);
  } catch (error) {
    logger.apiError('GET', '/api/tours', error, undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = tourSchema.parse(body);

    const tour = await prisma.tours.create({
      data: {
        title: validatedData.title,
        location_name: validatedData.location_name,
        price: BigInt(validatedData.price),
        category_id: Number(validatedData.category_id),
        description: validatedData.description,
        sub_title: (validatedData as any).sub_title,
        is_active: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      tour: { 
        ...tour, 
        price: tour.price.toString() 
      } 
    });
  } catch (error) {
    console.error('Create tour error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: error.message 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}