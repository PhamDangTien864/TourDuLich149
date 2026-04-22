import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const end = endDate ? new Date(endDate) : new Date();

    // 1. Total doanh thu trong khoảng thời gian
    const totalRevenue = await prisma.bookings.aggregate({
      _sum: { total_amount: true },
      where: {
        start_date: { gte: start, lte: end }
      }
    });

    // 2. Doanh thu theo tháng trong khoảng thời gian
    const rawMonthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(start_date, '%Y-%m') as month,
        SUM(total_amount) as revenue,
        COUNT(*) as bookings
      FROM bookings 
      WHERE start_date >= ${start} AND start_date <= ${end}
      GROUP BY DATE_FORMAT(start_date, '%Y-%m')
      ORDER BY month DESC
    `;

    const monthlyRevenue = rawMonthlyRevenue.map(item => ({
      month: item.month,
      revenue: Number(item.revenue || 0),
      bookings: Number(item.bookings || 0)
    }));

    // 3. Top tours trong khoảng thời gian
    const topTours = await prisma.bookings.groupBy({
      by: ['tour_id'],
      _sum: { total_amount: true },
      _count: { id: true },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: 5,
      where: {
        start_date: { gte: start, lte: end }
      }
    });

    const topTourIds = topTours.map(t => t.tour_id);
    const topTourDetails = await prisma.tours.findMany({
      where: { id: { in: topTourIds } },
      select: { id: true, title: true, location_name: true }
    });

    const topToursWithDetails = topTours.map(tour => {
      const details = topTourDetails.find(t => t.id === tour.tour_id);
      return {
        ...tour,
        tours: details
      };
    });

    // 4. Recent bookings trong khoảng thời gian
    const recentBookings = await prisma.bookings.findMany({
      include: {
        customers: { select: { full_name: true, phone_number: true } },
        tours: { select: { title: true, location_name: true } }
      },
      orderBy: { start_date: 'desc' },
      take: 10,
      where: {
        start_date: { gte: start, lte: end }
      }
    });

    // 5. Customer stats
    const customerStats = await prisma.accounts.groupBy({
      by: ['role_id'],
      _count: { id: true }
    });

    // 6. Tour stats
    const tourStats = await prisma.tours.groupBy({
      by: ['is_active'],
      _count: { id: true }
    });

    // 7. Province stats - thống kê tour theo tỉnh thành
    const provinceStats = await prisma.$queryRaw`
      SELECT 
        p.province_name as province,
        COUNT(DISTINCT t.id) as count
      FROM tours t
      LEFT JOIN provinces p ON t.province_id = p.id
      WHERE t.is_deleted = false
      GROUP BY p.province_name
      HAVING count > 0
      ORDER BY count DESC
      LIMIT 5
    `;

    // 8. Review stats
    const reviewStats = await prisma.reviews.aggregate({
      _avg: { rating: true },
      _count: { id: true }
    });

    const fiveStarCount = await prisma.reviews.count({
      where: { rating: 5 }
    });

    const reviewData = {
      avgRating: Number(reviewStats._avg.rating || 0).toFixed(1),
      totalReviews: reviewStats._count.id,
      fiveStar: fiveStarCount
    };

    // 9. Promotion stats
    const promotionStats = await prisma.promotions.findMany({
      select: {
        code: true,
        discount_value: true,
        used_count: true
      },
      orderBy: { used_count: 'desc' },
      take: 5
    });

    const promotionData = promotionStats.map(promo => ({
      code: promo.code,
      discountValue: Number(promo.discount_value),
      usedCount: promo.used_count
    }));

    // 10. Cancellation rate
    const totalBookings = await prisma.bookings.count({
      where: {
        start_date: { gte: start, lte: end }
      }
    });

    const cancelledBookings = await prisma.bookings.count({
      where: {
        start_date: { gte: start, lte: end },
        status: 'cancelled'
      }
    });

    const cancellationRate = totalBookings > 0 
      ? ((cancelledBookings / totalBookings) * 100).toFixed(1) 
      : 0;

    return NextResponse.json({
      totalRevenue: {
        _sum: { total_amount: Number(totalRevenue._sum.total_amount || 0) }
      },
      monthlyRevenue,
      topTours: topToursWithDetails.map(t => ({
        ...t,
        _sum: { total_amount: Number(t._sum.total_amount) }
      })),
      recentBookings: recentBookings.map(b => ({
        ...b,
        total_amount: Number(b.total_amount)
      })),
      customerStats,
      tourStats,
      provinceStats: provinceStats.map(p => ({
        ...p,
        count: Number(p.count)
      })),
      reviewStats: reviewData,
      promotionStats: promotionData,
      cancellationRate
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
