import { prisma } from "@/lib/prisma";
import AdminLayout from "../components/AdminLayout";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, MapPin, Star } from "lucide-react";

export default async function AnalyticsPage() {
  // Lây thô'ng kê chi tiê't
  const [
    totalRevenue,
    monthlyRevenue,
    topTours,
    recentBookings,
    customerStats,
    tourStats
  ] = await Promise.all([
    // Total doanh thu
    prisma.bookings.aggregate({
      _sum: { total_amount: true }
    }),
    
    // Doanh thu theo thang - dùng start_date thay thế
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
    
    // Top tours
    prisma.bookings.groupBy({
      by: ['tour_id'],
      _sum: { total_amount: true },
      _count: { id: true },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: 5
    }),
    
    // Recent bookings - dùng start_date thay thế
    prisma.bookings.findMany({
      include: {
        customer: { select: { full_name: true, phone_number: true } },
        tour: { select: { title: true, location_name: true } }
      },
      orderBy: { start_date: 'desc' },
      take: 10
    }),
    
    // Customer stats
    prisma.accounts.groupBy({
      by: ['role'],
      _count: { id: true }
    }),
    
    // Tour stats
    prisma.tours.groupBy({
      by: ['is_active'],
      _count: { id: true }
    })
  ]);

  // Lây thông tin chi tiê't cho top tours
  const topTourIds = topTours.map(t => t.tour_id);
  const topTourDetails = await prisma.tours.findMany({
    where: { id: { in: topTourIds } },
    select: { id: true, title: true, location_name: true }
  });

  const topToursWithDetails = topTours.map(tour => {
    const details = topTourDetails.find(t => t.id === tour.tour_id);
    return {
      ...tour,
      tour: details
    };
  });

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Thống kê</h1>
          <p className="text-slate-500">Phân tích và báo cáo kinh doanh</p>
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
              {Number(totalRevenue._sum.total_amount || 0).toLocaleString()}d
            </h3>
            <p className="text-slate-500 text-sm">Tổng doanh thu</p>
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
            <p className="text-slate-500 text-sm">Tổng booking</p>
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
            <p className="text-slate-500 text-sm">Tổng khách hàng</p>
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
            <p className="text-slate-500 text-sm">Tour hiện có</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Doanh thu theo thang
            </h3>
            <div className="space-y-4">
              {monthlyRevenue.slice(0, 6).map((item, index) => (
                <div key={item.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-slate-700 font-medium">{item.month}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600">
                      {Number(item.revenue).toLocaleString()}d
                    </p>
                    <p className="text-xs text-slate-400">{item.bookings} booking</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tours */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Top Tours doanh thu
            </h3>
            <div className="space-y-4">
              {topToursWithDetails.map((tour, index) => (
                <div key={tour.tour_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{tour.tour?.title}</p>
                      <p className="text-sm text-slate-500">{tour.tour?.location_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600">
                      {Number(tour._sum.total_amount).toLocaleString()}d
                    </p>
                    <p className="text-xs text-slate-400">{tour._count.id} booking</p>
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
            Booking gâ'n dây
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black tracking-widest">
                <tr>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Tour</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-800">{booking.customer.full_name}</p>
                        <p className="text-xs text-slate-400">{booking.customer.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-800">{booking.tour.title}</p>
                        <p className="text-xs text-slate-400">{booking.tour.location_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-green-600">
                        {Number(booking.total_amount).toLocaleString()}d
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600">
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
