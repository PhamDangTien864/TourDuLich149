import { prisma } from "@/lib/prisma";
import AdminLayout from "./components/AdminLayout";
import { 
  Users, Map, TicketCheck, ShieldAlert, 
  BarChart3, TrendingUp, DollarSign, Calendar,
  MessageSquareMore, UserPlus, Send, Activity,
  Eye, Clock, CheckCircle, AlertCircle, Plus
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  // Lấy data thống kê toàn diện
  const [
    totalTours,
    totalUsers,
    pendingBookings,
    recentBookings,
    totalRevenue,
    monthlyRevenue,
    activeUsers,
    completedTours,
    topTours
  ] = await Promise.all([
    // Tổng số tours
    prisma.tours.count({ where: { is_deleted: false } }),
    
    // Tổng số users
    prisma.accounts.count({ where: { is_deleted: false } }),
    
    // Booking chờ duyệt
    prisma.bookings.count({ where: { is_confirmed: false } }),
    
    // 5 booking gần nhất
    prisma.bookings.findMany({ 
      take: 5, 
      include: { 
        customer: { select: { full_name: true, phone_number: true } },
        tour: { select: { title: true, location_name: true } }
      }, 
      orderBy: { id: 'desc' } 
    }),
    
    // Tổng doanh thu
    prisma.bookings.aggregate({
      _sum: { total_amount: true }
    }),
    
    // Doanh thu 7 ngày gần nhất
    prisma.$queryRaw`
      SELECT 
        DATE(start_date) as date,
        SUM(total_amount) as revenue,
        COUNT(*) as bookings
      FROM bookings 
      WHERE start_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      AND is_confirmed = true
      GROUP BY DATE(start_date)
      ORDER BY date DESC
    `,
    
    // Users hoạt động trong 30 ngày
    prisma.accounts.count({
      where: {
        is_deleted: false,
        // Có thể thêm điều kiện last_login nếu có
      }
    }),
    
    // Tours đã hoàn thành
    prisma.tours.count({
      where: { 
        is_deleted: false,
        is_active: true 
      }
    }),
    
    // Top 3 tours doanh thu cao nhất
    prisma.bookings.groupBy({
      by: ['tour_id'],
      _sum: { total_amount: true },
      _count: { id: true },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: 3
    })
  ]);
  
  // Lấy chi tiết top tours
  const topTourIds = topTours.map(t => t.tour_id);
  const topTourDetails = await prisma.tours.findMany({
    where: { id: { in: topTourIds } },
    select: { id: true, title: true, location_name: true }
  });

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Admin Dashboard</h1>
              <p className="text-slate-500 font-bold mt-2">VietTravel Luxury Enterprise Management System</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-200">
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 
                  System Online
                </div>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
                <p className="text-blue-600 font-black text-xs">{new Date().toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<DollarSign size={24} />} 
            title="Tổng Doanh Thu" 
            value={Number(totalRevenue._sum.total_amount || 0).toLocaleString()}
            subtitle="VNĐ"
            color="bg-green-500"
            trend={"+12.5%"}
          />
          <StatCard 
            icon={<Users size={24} />} 
            title="Total Users" 
            value={totalUsers}
            subtitle="Accounts"
            color="bg-blue-500"
            trend={"+8.2%"}
          />
          <StatCard 
            icon={<TicketCheck size={24} />} 
            title="Pending Bookings" 
            value={pendingBookings}
            subtitle="Need Review"
            color="bg-orange-500"
            trend={"-3.1%"}
          />
          <StatCard 
            icon={<Map size={24} />} 
            title="Active Tours" 
            value={totalTours}
            subtitle="Available"
            color="bg-purple-500"
            trend={"+5.7%"}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Revenue Chart */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-blue-600" size={28} />
                  <h3 className="text-2xl font-black text-slate-900">Revenue Analytics</h3>
                </div>
                <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="h-48 flex items-end gap-3 mb-6">
                {monthlyRevenue.length > 0 ? (
                  monthlyRevenue.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all cursor-pointer"
                        style={{ height: `${Math.min(100, (Number(day.revenue) / 1000000) * 100)}%` }}
                        title={`${new Date(day.date).toLocaleDateString('vi-VN')}: ${Number(day.revenue).toLocaleString()} VNĐ`}
                      />
                      <span className="text-xs text-slate-500 font-bold">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 text-center text-slate-400 font-bold">
                    No data available
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold">Total Revenue: {Number(totalRevenue._sum.total_amount || 0).toLocaleString()} VNĐ</span>
                <span className="text-green-600 font-bold">↑ 12.5% from last period</span>
              </div>
            </div>

            {/* Top Performing Tours */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="text-green-600" size={28} />
                <h3 className="text-2xl font-black text-slate-900">Top Performing Tours</h3>
              </div>
              
              <div className="space-y-4">
                {topTours.map((tour, index) => {
                  const tourDetail = topTourDetails.find(t => t.id === tour.tour_id);
                  return (
                    <div key={tour.tour_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{tourDetail?.title || 'Unknown Tour'}</p>
                          <p className="text-sm text-slate-500">{tourDetail?.location_name || 'Unknown Location'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-600">
                          {Number(tour._sum.total_amount).toLocaleString()} VNĐ
                        </p>
                        <p className="text-xs text-slate-400">{tour._count.id} bookings</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Activity and Quick Actions */}
          <div className="space-y-8">
            
            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <Activity className="text-blue-600" size={28} />
                <h3 className="text-2xl font-black text-slate-900">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TicketCheck className="text-orange-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">{booking.customer.full_name}</p>
                        <p className="text-xs text-slate-500">{booking.tour.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            booking.is_confirmed 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {booking.is_confirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center font-bold py-8">No recent activity</p>
                )}
              </div>
              
              <Link href="/admin/bookings" className="w-full mt-6 bg-slate-100 hover:bg-slate-200 py-3 rounded-2xl font-black text-sm text-center transition-colors">
                View All Bookings
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-black mb-8">Quick Actions</h3>
              
              <div className="space-y-4">
                <QuickAction 
                  icon={<Plus size={20} />}
                  label="Add New Tour"
                  href="/admin/tours/create"
                  color="bg-white/20 hover:bg-white/30"
                />
                <QuickAction 
                  icon={<UserPlus size={20} />}
                  label="Create Staff Account"
                  href="/admin/users/create"
                  color="bg-white/20 hover:bg-white/30"
                />
                <QuickAction 
                  icon={<BarChart3 size={20} />}
                  label="View Analytics"
                  href="/admin/analytics"
                  color="bg-white/20 hover:bg-white/30"
                />
                <QuickAction 
                  icon={<ShieldAlert size={20} />}
                  label="Manage Roles"
                  href="/admin/roles"
                  color="bg-white/20 hover:bg-white/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon, title, value, subtitle, color, trend }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${
            trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend}
          </span>
        </div>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
      <p className="text-slate-500 text-sm font-bold">{subtitle}</p>
    </div>
  );
}

function QuickAction({ icon, label, href, color }) {
  return (
    <Link href={href} className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${color}`}>
      {icon}
      <span className="font-bold">{label}</span>
    </Link>
  );
}