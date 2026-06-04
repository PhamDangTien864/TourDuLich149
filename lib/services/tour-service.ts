import { prisma } from '@/lib/prisma';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { removeVietnameseAccents } from '@/lib/utils';

export interface TourFilters {
  category?: number;
  location?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export interface TourWithStats {
  id: number;
  title: string;
  location_name: string | null;
  price: string;
  category_id?: number;
  category_name?: string;
  description?: string;
  sub_title?: string;
  max_slots?: number;
  is_active: boolean;
  tour_images: Array<{ image_url: string }>;
  tour_categories?: { id: number; category_name: string } | null;
  averageRating?: number;
  totalReviews?: number;
  totalBookings?: number;
  remainingSlots?: number;
  maxSlots?: number;
}

export interface PaginatedTours {
  tours: TourWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TourService {
  /**
   * Get tours with filters and pagination
   * Extracts business logic from API route
   */
  static async getTours(filters: TourFilters): Promise<PaginatedTours> {
    const {
      category,
      location,
      q,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 10
    } = filters;

    // Create cache key based on filters
    const cacheKey = `${CACHE_KEYS.TOURS}:${JSON.stringify({ category, location, q, minPrice, maxPrice, sortBy, page, limit })}`;

    // Try to get from cache first
    const cached = cache.get(cacheKey) as PaginatedTours | null;
    if (cached) {
      return cached;
    }

    let tours: TourWithStats[];
    let total = 0;

    // Handle search with Vietnamese accent support
    if (q) {
      const result = await this.searchToursWithVietnameseAccents(q, page, limit);
      tours = result.tours;
      total = result.total;
    } else {
      const result = await this.getToursWithFilters(
        category,
        location,
        minPrice,
        maxPrice,
        undefined, // minSlots
        undefined, // minDuration
        undefined, // maxDuration
        undefined, // availability
        sortBy,
        page,
        limit
      );
      tours = result.tours;
      total = result.total;
    }

    const response: PaginatedTours = {
      tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, response, 5 * 60 * 1000);

    return response;
  }

  /**
   * Search tours with Vietnamese accent-insensitive search
   * Extracts complex SQL logic from API route
   */
  private static async searchToursWithVietnameseAccents(
    q: string,
    page: number,
    limit: number
  ): Promise<{ tours: TourWithStats[]; total: number }> {
    const searchQuery = q.toLowerCase();
    const searchQueryNoAccent = removeVietnameseAccents(searchQuery);
    
    // Use raw SQL for Vietnamese accent-insensitive search
    const toursRaw = await prisma.$queryRaw`
      SELECT t.*, 
             tc.id as category_id, tc.category_name,
             ti.id as image_id, ti.image_url
      FROM tours t
      LEFT JOIN tour_categories tc ON t.category_id = tc.id
      LEFT JOIN tour_images ti ON t.id = ti.tour_id AND ti.is_primary = true
      WHERE t.is_active = true 
        AND t.is_deleted = false
        AND (
          LOWER(t.title) LIKE ${'%' + searchQuery + '%'}
          OR LOWER(t.location_name) LIKE ${'%' + searchQuery + '%'}
          OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
              LOWER(t.title), 'à', 'a'), 'á', 'a'), 'ả', 'a'), 'ã', 'a'), 'ạ', 'a'),
              'ă', 'a'), 'ằ', 'a'), 'ắ', 'a'), 'ẳ', 'a'), 'ẵ', 'a'), 'ặ', 'a'),
              'â', 'a'), 'ầ', 'a'), 'ấ', 'a'), 'ẩ', 'a'), 'ẫ', 'a'), 'ậ', 'a'),
              'đ', 'd'), 'è', 'e'), 'é', 'e'), 'ẻ', 'e'), 'ẽ', 'e'), 'ẹ', 'e'),
              'ê', 'e'), 'ề', 'e'), 'ế', 'e'), 'ể', 'e'), 'ễ', 'e'), 'ệ', 'e'),
              'ì', 'i'), 'í', 'i'), 'ỉ', 'i'), 'ĩ', 'i'), 'ị', 'i'),
              'ò', 'o'), 'ó', 'o'), 'ỏ', 'o'), 'õ', 'o'), 'ọ', 'o'),
              'ô', 'o'), 'ồ', 'o'), 'ố', 'o'), 'ổ', 'o'), 'ỗ', 'o'), 'ộ', 'o'),
              'ơ', 'o'), 'ờ', 'o'), 'ớ', 'o'), 'ở', 'o'), 'ỡ', 'o'), 'ợ', 'o'),
              'ù', 'u'), 'ú', 'u'), 'ủ', 'u'), 'ũ', 'u'), 'ụ', 'u'),
              'ư', 'u'), 'ừ', 'u'), 'ứ', 'u'), 'ử', 'u'), 'ữ', 'u'), 'ự', 'u'),
              'ỳ', 'y'), 'ý', 'y'), 'ỷ', 'y'), 'ỹ', 'y'), 'ỵ', 'y')
          LIKE ${'%' + searchQueryNoAccent + '%'}
          OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
              LOWER(t.location_name), 'à', 'a'), 'á', 'a'), 'ả', 'a'), 'ã', 'a'), 'ạ', 'a'),
              'ă', 'a'), 'ằ', 'a'), 'ắ', 'a'), 'ẳ', 'a'), 'ẵ', 'a'), 'ặ', 'a'),
              'â', 'a'), 'ầ', 'a'), 'ấ', 'a'), 'ẩ', 'a'), 'ẫ', 'a'), 'ậ', 'a'),
              'đ', 'd'), 'è', 'e'), 'é', 'e'), 'ẻ', 'e'), 'ẽ', 'e'), 'ẹ', 'e'),
              'ê', 'e'), 'ề', 'e'), 'ế', 'e'), 'ể', 'e'), 'ễ', 'e'), 'ệ', 'e'),
              'ì', 'i'), 'í', 'i'), 'ỉ', 'i'), 'ĩ', 'i'), 'ị', 'i'),
              'ò', 'o'), 'ó', 'o'), 'ỏ', 'o'), 'õ', 'o'), 'ọ', 'o'),
              'ô', 'o'), 'ồ', 'o'), 'ố', 'o'), 'ổ', 'o'), 'ỗ', 'o'), 'ộ', 'o'),
              'ơ', 'o'), 'ờ', 'o'), 'ớ', 'o'), 'ở', 'o'), 'ỡ', 'o'), 'ợ', 'o'),
              'ù', 'u'), 'ú', 'u'), 'ủ', 'u'), 'ũ', 'u'), 'ụ', 'u'),
              'ư', 'u'), 'ừ', 'u'), 'ứ', 'u'), 'ử', 'u'), 'ữ', 'u'), 'ự', 'u'),
              'ỳ', 'y'), 'ý', 'y'), 'ỷ', 'y'), 'ỹ', 'y'), 'ỵ', 'y')
          LIKE ${'%' + searchQueryNoAccent + '%'}
        )
      ORDER BY t.id DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
    
    // Get total count for search
    const totalRaw = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM tours t
      WHERE t.is_active = true 
        AND t.is_deleted = false
        AND (
          LOWER(t.title) LIKE ${'%' + searchQuery + '%'}
          OR LOWER(t.location_name) LIKE ${'%' + searchQuery + '%'}
          OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
              LOWER(t.title), 'à', 'a'), 'á', 'a'), 'ả', 'a'), 'ã', 'a'), 'ạ', 'a'),
              'ă', 'a'), 'ằ', 'a'), 'ắ', 'a'), 'ẳ', 'a'), 'ẵ', 'a'), 'ặ', 'a'),
              'â', 'a'), 'ầ', 'a'), 'ấ', 'a'), 'ẩ', 'a'), 'ẫ', 'a'), 'ậ', 'a'),
              'đ', 'd'), 'è', 'e'), 'é', 'e'), 'ẻ', 'e'), 'ẽ', 'e'), 'ẹ', 'e'),
              'ê', 'e'), 'ề', 'e'), 'ế', 'e'), 'ể', 'e'), 'ễ', 'e'), 'ệ', 'e'),
              'ì', 'i'), 'í', 'i'), 'ỉ', 'i'), 'ĩ', 'i'), 'ị', 'i'),
              'ò', 'o'), 'ó', 'o'), 'ỏ', 'o'), 'õ', 'o'), 'ọ', 'o'),
              'ô', 'o'), 'ồ', 'o'), 'ố', 'o'), 'ổ', 'o'), 'ỗ', 'o'), 'ộ', 'o'),
              'ơ', 'o'), 'ờ', 'o'), 'ớ', 'o'), 'ở', 'o'), 'ỡ', 'o'), 'ợ', 'o'),
              'ù', 'u'), 'ú', 'u'), 'ủ', 'u'), 'ũ', 'u'), 'ụ', 'u'),
              'ư', 'u'), 'ừ', 'u'), 'ứ', 'u'), 'ử', 'u'), 'ữ', 'u'), 'ự', 'u'),
              'ỳ', 'y'), 'ý', 'y'), 'ỷ', 'y'), 'ỹ', 'y'), 'ỵ', 'y')
          LIKE ${'%' + searchQueryNoAccent + '%'}
          OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
              LOWER(t.location_name), 'à', 'a'), 'á', 'a'), 'ả', 'a'), 'ã', 'a'), 'ạ', 'a'),
              'ă', 'a'), 'ằ', 'a'), 'ắ', 'a'), 'ẳ', 'a'), 'ẵ', 'a'), 'ặ', 'a'),
              'â', 'a'), 'ầ', 'a'), 'ấ', 'a'), 'ẩ', 'a'), 'ẫ', 'a'), 'ậ', 'a'),
              'đ', 'd'), 'è', 'e'), 'é', 'e'), 'ẻ', 'e'), 'ẽ', 'e'), 'ẹ', 'e'),
              'ê', 'e'), 'ề', 'e'), 'ế', 'e'), 'ể', 'e'), 'ễ', 'e'), 'ệ', 'e'),
              'ì', 'i'), 'í', 'i'), 'ỉ', 'i'), 'ĩ', 'i'), 'ị', 'i'),
              'ò', 'o'), 'ó', 'o'), 'ỏ', 'o'), 'õ', 'o'), 'ọ', 'o'),
              'ô', 'o'), 'ồ', 'o'), 'ố', 'o'), 'ổ', 'o'), 'ỗ', 'o'), 'ộ', 'o'),
              'ơ', 'o'), 'ờ', 'o'), 'ớ', 'o'), 'ở', 'o'), 'ỡ', 'o'), 'ợ', 'o'),
              'ù', 'u'), 'ú', 'u'), 'ủ', 'u'), 'ũ', 'u'), 'ụ', 'u'),
              'ư', 'u'), 'ừ', 'u'), 'ứ', 'u'), 'ử', 'u'), 'ữ', 'u'), 'ự', 'u'),
              'ỳ', 'y'), 'ý', 'y'), 'ỷ', 'y'), 'ỹ', 'y'), 'ỵ', 'y')
          LIKE ${'%' + searchQueryNoAccent + '%'}
        )
    `;

    const total = Number((totalRaw as any)[0]?.total || 0);

    // Format raw results
    const toursFormatted = (toursRaw as any[]).map((tour: any) => ({
      id: tour.id,
      title: tour.title,
      location_name: tour.location_name,
      price: tour.price?.toString() || '0',
      category_id: tour.category_id,
      category_name: tour.category_name,
      description: tour.description,
      sub_title: tour.sub_title,
      max_slots: tour.max_slots,
      is_active: tour.is_active,
      tour_images: tour.image_url ? [{ image_url: tour.image_url }] : [],
      tour_categories: tour.category_name ? { id: tour.category_id, category_name: tour.category_name } : null
    }));

    return { tours: toursFormatted, total };
  }

  /**
   * Get tours with filters (no search)
   */
  private static async getToursWithFilters(
    category?: number,
    location?: string,
    minPrice?: number,
    maxPrice?: number,
    minSlots?: number,
    minDuration?: number,
    maxDuration?: number,
    availability?: string,
    sortBy: string = 'newest',
    page: number = 1,
    limit: number = 10
  ): Promise<{ tours: TourWithStats[]; total: number }> {
    // Build where clause for filtering
    const where: any = {
      is_active: true,
      is_deleted: false
    };

    if (category) {
      where.category_id = category;
    }

    if (location) {
      where.location_name = {
        contains: location
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = BigInt(parseInt(minPrice.toString()));
      if (maxPrice) where.price.lte = BigInt(parseInt(maxPrice.toString()));
    }

    if (minDuration || maxDuration) {
      where.duration_days = {};
      if (minDuration) where.duration_days.gte = minDuration;
      if (maxDuration) where.duration_days.lte = maxDuration;
    }

    if (minSlots) {
      where.max_participants = { gte: minSlots };
    }

    if (availability === 'available') {
      // Filter tours with available schedules
      // This is a complex filter that requires joining with tour_schedules
      // For now, we'll skip this as it requires a more complex query
      // TODO: Implement proper availability filtering by checking tour_schedules
    }

    // Get total count for pagination
    const total = await prisma.tours.count({ where });

    // Build orderBy based on sortBy parameter
    let orderBy: any = { id: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    // Get tours with pagination
    const tours = await prisma.tours.findMany({
      where,
      include: {
        tour_categories: {
          select: {
            id: true,
            category_name: true
          }
        },
        tour_images: {
          take: 1
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    // Get all reviews and bookings in single queries to avoid N+1
    const tourIds = tours.map(t => t.id);
    const [allReviews, allBookings, bookingCounts] = await Promise.all([
      tourIds.length > 0 ? prisma.reviews.findMany({
        where: { tour_id: { in: tourIds }, is_deleted: false },
        select: { tour_id: true, rating: true }
      }) : [],
      tourIds.length > 0 ? prisma.bookings.groupBy({
        by: ['tour_id'],
        where: { tour_id: { in: tourIds } },
        _count: { id: true }
      }) : [],
      tourIds.length > 0 ? prisma.bookings.groupBy({
        by: ['tour_id'],
        where: { 
          tour_id: { in: tourIds },
          status: { not: 'CANCELLED' }
        },
        _count: { id: true }
      }) : []
    ]);

    // Aggregate reviews and bookings by tour_id
    const reviewsByTour: Record<number, number[]> = allReviews.reduce((acc, r) => {
      if (!acc[r.tour_id]) acc[r.tour_id] = [];
      if (r.rating !== null) acc[r.tour_id].push(r.rating);
      return acc;
    }, {} as Record<number, number[]>);

    const bookingsByTour: Record<number, number> = allBookings.reduce((acc, b) => {
      if (b._count && typeof b._count.id === 'number') {
        acc[b.tour_id] = b._count.id;
      }
      return acc;
    }, {} as Record<number, number>);

    const activeBookingsByTour: Record<number, number> = bookingCounts.reduce((acc, b) => {
      acc[b.tour_id] = b._count.id;
      return acc;
    }, {} as Record<number, number>);

    // Format response with pre-calculated stats
    const toursFormatted = tours.map(tour => {
      const tourReviews = reviewsByTour[tour.id] || [];
      const averageRating = tourReviews.length > 0
        ? tourReviews.reduce((sum: number, r: number) => sum + r, 0) / tourReviews.length
        : 0;

      const activeBookings = activeBookingsByTour[tour.id] || 0;
      const remainingSlots = tour.max_slots ? Math.max(0, tour.max_slots - activeBookings) : null;

      return {
        ...tour,
        price: tour.price.toString(),
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: tourReviews.length,
        totalBookings: bookingsByTour[tour.id] || 0,
        remainingSlots,
        maxSlots: tour.max_slots
      };
    });

    return { tours: toursFormatted as unknown as TourWithStats[], total };
  }

  /**
   * Get tour by ID with full details
   */
  static async getTourById(tourId: number): Promise<any> {
    const tour = await prisma.tours.findUnique({
      where: { id: tourId, is_deleted: false },
      include: {
        tour_categories: true,
        tour_images: true,
        departure_schedules: {
          where: { is_active: true }
        }
      }
    });

    if (!tour) {
      return null;
    }

    return {
      ...tour,
      price: tour.price.toString()
    };
  }

  /**
   * Get tour availability for a specific tour
   */
  static async getTourAvailability(tourId: number): Promise<any> {
    const schedules = await prisma.departure_schedules.findMany({
      where: {
        tour_id: tourId,
        is_active: true,
        departure_date: { gte: new Date() }
      },
      orderBy: { departure_date: 'asc' }
    });

    return schedules.map(schedule => ({
      id: schedule.id,
      departure_date: schedule.departure_date,
      available_slots: schedule.available_slots,
      total_slots: schedule.total_slots
    }));
  }

  /**
   * Create a new tour
   */
  static async createTour(data: any): Promise<any> {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingTour = await prisma.tours.findUnique({
      where: { slug }
    });

    if (existingTour) {
      throw new Error('Tour với tiêu đề này đã tồn tại. Vui lòng chọn tiêu đề khác.');
    }

    const tour = await prisma.tours.create({
      data: {
        title: data.title,
        slug,
        location_name: data.location_name,
        price: BigInt(data.price),
        category_id: Number(data.category_id),
        description: data.description,
        sub_title: data.sub_title,
        is_active: true
      }
    });

    // Invalidate cache
    cache.invalidatePattern(CACHE_KEYS.TOURS);

    return {
      ...tour,
      price: tour.price.toString()
    };
  }

  /**
   * Update tour
   */
  static async updateTour(tourId: number, data: any): Promise<any> {
    const tour = await prisma.tours.update({
      where: { id: tourId },
      data: {
        ...data,
        ...(data.price && { price: BigInt(data.price) })
      }
    });

    // Invalidate cache
    cache.invalidatePattern(CACHE_KEYS.TOURS);

    return {
      ...tour,
      price: tour.price.toString()
    };
  }

  /**
   * Delete tour (soft delete)
   */
  static async deleteTour(tourId: number): Promise<void> {
    await prisma.tours.update({
      where: { id: tourId },
      data: { is_deleted: true }
    });

    // Invalidate cache
    cache.invalidatePattern(CACHE_KEYS.TOURS);
  }
}
