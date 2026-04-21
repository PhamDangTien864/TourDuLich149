import { prisma } from "@/lib/prisma";
import AdminLayout from "../components/AdminLayout";
import { TrendingUp, Users, DollarSign, MapPin, Star, Calendar } from "lucide-react";

export default async function AnalyticsPage() {
  // Lấy thống kê chi tiết
  const [
    totalRevenue,
    rawMonthlyRevenue,
    topTours,
    recentBookings,
    customerStats,
    tourStats
  ] = await Promise.all([
    // 1. Total doanh thu
    prisma.bookings.aggregate({
      _sum: { total_amount: true }
    }),
    
    // 2. Doanh thu theo tháng
    prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(start_date, '%Y-%m') as month,
        SUM(total_amount) as revenue,
        COUNT(*) as bookings
      FROM bookings 
      GROUP BY DATE_FORMAT(start_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `,
    
    // 3. Top tours
    prisma.bookings.groupBy({
      by: ['tour_id'],
      _sum: { total_amount: true },
      _count: { id: true },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: 5
    }),
    
    // 4. Recent bookings - ĐÃ FIX: customer -> customers, tour -> tours
    prisma.bookings.findMany({
      include: {
        customers: { select: { full_name: true, phone_number: true } },
        tours: { select: { title: true, location_name: true } }
      },
      orderBy: { start_date: 'desc' },
      take: 10
    }),
    
    // 5. Customer stats
    prisma.accounts.groupBy({
      by: ['role_id'],
      _count: { id: true }
    }),
    
    // 6. Tour stats
    prisma.tours.groupBy({
      by: ['is_active'],
      _count: { id: true }
    })
  ]);

  // Parse BigInt từ queryRaw để tránh lỗi Next.js Server Component không serialize được BigInt
  const monthlyRevenue = rawMonthlyRevenue.map(item => ({
    month: item.month,
    revenue: Number(item.revenue || 0),
    bookings: Number(item.bookings || 0)
  }));

  // Lấy thông tin chi tiết cho top tours
  const topTourIds = topTours.map(t => t.tour_id);
  const topTourDetails = await prisma.tours.findMany({
    where: { id: { in: topTourIds } },
    select: { id: true, title: true, location_name: true }
  });

  const topToursWithDetails = topTours.map(tour => {
    const details = topTourDetails.find(t => t.id === tour.tour_id);
    return {
      ...tour,
      tours: details // Đổi tên key thành 'tours' cho đồng bộ
    };
  });

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Thống kê Analytics</h1>
          <p className="text-slate-500 font-bold">Phân tích và báo cáo kinh doanh VietTravel Luxury</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <span className="text-green-500 text-sm font-bold">+15%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {Number(totalRevenue._sum.total_amount || 0).toLocaleString()}đ
            </h3>
            <p className="text-slate-500 text-sm font-bold">Tổng doanh thu</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-green-600" size={20} />
              </div>
              <span className="text-green-500 text-sm font-bold">+25%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {recentBookings.length}
            </h3>
            <p className="text-slate-500 text-sm font-bold">Booking gần đây</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="text-purple-600" size={20} />
              </div>
              <span className="text-green-500 text-sm font-bold">+12%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {customerStats.reduce((sum, stat) => sum + stat._count.id, 0)}
            </h3>
            <p className="text-slate-500 text-sm font-bold">Tổng khách hàng</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <MapPin className="text-yellow-600" size={20} />
              </div>
              <span className="text-green-500 text-sm font-bold">+8%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {tourStats.find(s => s.is_active)?._count.id || 0}
            </h3>
            <p className="text-slate-500 text-sm font-bold">Tour đang chạy</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Doanh thu theo tháng
            </h3>
            <div className="space-y-4">
              {monthlyRevenue.slice(0, 6).map((item, index) => (
                <div key={item.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-slate-700 font-bold">{item.month}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600">
                      {Number(item.revenue).toLocaleString()}đ
                    </p>
                    <p className="text-xs text-slate-400 font-bold">{item.bookings} booking</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Top Tours doanh thu
            </h3>
            <div className="space-y-4">
              {topToursWithDetails.map((tour, index) => (
                <div key={tour.tour_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{tour.tours?.title || 'Tour không tên'}</p>
                      <p className="text-xs text-slate-500 font-bold">{tour.tours?.location_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600">
                      {Number(tour._sum.total_amount).toLocaleString()}đ
                    </p>
                    <p className="text-xs text-slate-400 font-bold">{tour._count.id} booking</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Booking gần đây nhất
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Tour</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Ngày đi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        {/* FIX: customer -> customers */}
                        <p className="font-bold text-slate-800">{booking.customers?.full_name || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{booking.customers?.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {/* FIX: tour -> tours */}
                        <p className="font-bold text-slate-800 text-sm">{booking.tours?.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{booking.tours?.location_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-green-600">
                        {Number(booking.total_amount).toLocaleString()}đ
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600 font-bold">
                        {new Date(booking.start_date).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}