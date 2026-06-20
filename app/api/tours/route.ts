export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { tourSchema } from '@/lib/validations';
import { TourService } from '@/lib/services/tour-service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationHandler } from '@/lib/api-validation';
import { ErrorHandler } from '@/lib/errors';
import { prisma } from "@/lib/prisma";
import { requireRole } from '@/lib/middleware';
import { normalizeVietnameseText } from '@/lib/text-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Lấy tất cả tham số từ URL
    const q = searchParams.get('q') || undefined;
    const departure = searchParams.get('departure') || undefined;
    const date = searchParams.get('date') || undefined;
    const passengersParam = searchParams.get('passengers');
    const passengers = passengersParam ? parseInt(passengersParam) : undefined;
    const location = searchParams.get('location') || undefined;
    const categoryParam = searchParams.get('category');
    const categoryId = categoryParam ? parseInt(categoryParam) : undefined;
    
    const minPriceParam = searchParams.get('minPrice');
    const minPrice = minPriceParam ? parseInt(minPriceParam) : undefined;
    const maxPriceParam = searchParams.get('maxPrice');
    const maxPrice = maxPriceParam ? parseInt(maxPriceParam) : undefined;
    
    const minDurationParam = searchParams.get('minDuration');
    const minDuration = minDurationParam ? parseInt(minDurationParam) : undefined;
    const maxDurationParam = searchParams.get('maxDuration');
    const maxDuration = maxDurationParam ? parseInt(maxDurationParam) : undefined;

    // Các tham số liên quan đến lịch trình (bảng departure_schedules)
    const departureDate = searchParams.get('departureDate');
    const minSlotsParam = searchParams.get('minSlots');
    const minSlots = minSlotsParam ? parseInt(minSlotsParam) : undefined;
    const availability = searchParams.get('availability');

    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const skip = (page - 1) * limit;

    // 2. Xây dựng điều kiện lọc (Where Clause)
    const where: any = {
      is_deleted: false,
      is_active: true,
    };

    // Tìm kiếm text (MySQL mặc định không phân biệt hoa thường)
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { location_name: { contains: q } }
      ];
    }

    // Filter by departure location
    if (departure) {
      where.location_name = { contains: departure };
    }

    if (location) {
      where.location_name = { contains: location };
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minDuration !== undefined || maxDuration !== undefined) {
      where.duration_days = {};
      if (minDuration !== undefined) where.duration_days.gte = minDuration;
      if (maxDuration !== undefined) where.duration_days.lte = maxDuration;
    }

    // Lọc qua bảng lịch trình (departure_schedules) bằng toán tử some
    // Chỉ áp dụng khi thực sự có giá trị lọc và không bắt buộc tour phải có departure_schedules
    const hasScheduleFilter = departureDate || date || (minSlots !== undefined && minSlots > 0) || availability || (passengers !== undefined && passengers > 0);
    if (hasScheduleFilter) {
      where.departure_schedules = {
        some: {
          is_active: true,
          ...(departureDate && { departure_date: { gte: new Date(departureDate) } }),
          ...(date && { departure_date: { gte: new Date(date) } }),
          ...(minSlots !== undefined && minSlots > 0 && { available_slots: { gte: minSlots } }),
          ...(passengers !== undefined && passengers > 0 && { available_slots: { gte: passengers } }),
          ...(availability === 'available' && { available_slots: { gt: 0 } }),
          ...(availability === 'limited' && { available_slots: { gt: 0, lte: 5 } }),
        }
      };
    }

    // 3. Xây dựng điều kiện sắp xếp
    let orderBy: any = { created_at: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'best_selling') {
      // Sort by booking count (requires aggregation - simplified for now)
      // TODO: Implement proper best_selling by counting completed bookings
      orderBy = { created_at: 'desc' };
    } 

    // 4. Truy vấn Database trực tiếp
    const [tours, total] = await Promise.all([
      prisma.tours.findMany({
        where,
        include: {
          tour_categories: true,
          tour_images: { orderBy: { is_primary: 'desc' }, take: 1 }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.tours.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);
    
    // Convert BigInt to Number for JSON serialization
    const serializedTours = tours.map((tour: any) => ({
      ...tour,
      price: Number(tour.price),
      max_slots: Number(tour.max_slots),
      duration_days: Number(tour.duration_days),
      min_age: Number(tour.min_age),
      max_age: tour.max_age ? Number(tour.max_age) : null
    }));
    
    const result = { tours: serializedTours, pagination: { total, page, totalPages, limit } };
    
    const response = successResponse(result);
    // response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError);
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}

export async function POST(req: NextRequest) {
  return requireRole([1])(async (request) => {
    try {
      const body = await request.json();
      
      const validationResult = ValidationHandler.validateOrErrorResponse(tourSchema, body);
      if (validationResult) {
        return validationResult;
      }

      const validatedData = ValidationHandler.validateOrThrow(tourSchema, body);
      
      const tour = await TourService.createTour(validatedData);

      return successResponse({ tour }, 'Tour được tạo thành công');
    } catch (error) {
      const bookingError = ErrorHandler.handle(error);
      ErrorHandler.log(bookingError);
      return errorResponse(bookingError.message, bookingError.statusCode);
    }
  })(req);
}