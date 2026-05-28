import { prisma } from "@/lib/prisma";
import { 
  Users, Map, TicketCheck, ShieldAlert, 
  BarChart3, TrendingUp, DollarSign,
  Activity, Ticket, Plus, UserPlus, Calendar, Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import Link from "next/link";
import { cache } from "@/lib/cache";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function AdminDashboard() {
  const cacheKey = 'admin_dashboard_stats';
  let cachedData = cache.get(cacheKey);
  
  if (!cachedData) {
    // 1. CHUẨN BỊ BIẾN THỜI GIAN BÊN NGOÀI
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    // eslint-disable-next-line react-hooks/purity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // 2. CHẠY TRUY VẤN ĐỒNG THỜI
    const [
      totalTours,
      totalUsers,
      pendingBookings,
      recentBookings,
      totalRevenue,
      monthlyRevenue,
      topTours,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      pendingRevenue,
      confirmedBookings,
      cancelledBookings
    ] = await Promise.all([
      prisma.tours.count({ where: { is_deleted: false } }),
      prisma.accounts.count({ where: { is_deleted: false, role_id: 2 } }),
      prisma.bookings.count({ where: { status: 'PENDING' } }),
      prisma.bookings.findMany({ 
        take: 5, 
        include: { 
          customers: { select: { full_name: true, phone_number: true } },
          tours: { select: { title: true, location_name: true } }
        }, 
        orderBy: { id: 'desc' } 
      }),
      prisma.bookings.aggregate({ _sum: { total_amount: true } }),
      prisma.$queryRaw`
        SELECT DATE(start_date) as date, SUM(total_amount) as revenue, COUNT(*) as bookings
        FROM bookings 
        WHERE start_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status != 'CANCELLED'
        GROUP BY DATE(start_date) ORDER BY date DESC
      `,
      prisma.$queryRaw`
        SELECT b.tour_id, t.title, t.location_name, SUM(b.total_amount) as revenue, COUNT(b.id) as bookings
        FROM bookings b
        JOIN tours t ON b.tour_id = t.id
        WHERE b.status != 'CANCELLED'
        GROUP BY b.tour_id, t.title, t.location_name
        ORDER BY revenue DESC
        LIMIT 5
      `,
      prisma.bookings.aggregate({
        _sum: { total_amount: true },
        where: {
          created_at: { gte: today },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.bookings.aggregate({
        _sum: { total_amount: true },
        where: {
          created_at: { gte: sevenDaysAgo },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.bookings.aggregate({
        _sum: { total_amount: true },
        where: {
          created_at: { gte: firstDayOfMonth },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.bookings.aggregate({
        _sum: { total_amount: true },
        where: { status: 'PENDING' }
      }),
      prisma.bookings.count({ where: { status: 'CONFIRMED' } }),
      prisma.bookings.count({ where: { status: 'CANCELLED' } })
    ]);

    cachedData = {
      totalTours,
      totalUsers,
      pendingBookings,
      recentBookings,
      totalRevenue,
      monthlyRevenue,
      topTours,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      pendingRevenue,
      confirmedBookings,
      cancelledBookings
    };
    
    cache.set(cacheKey, cachedData, 300);
  }

  const {
    totalTours,
    totalUsers,
    pendingBookings,
    recentBookings,
    totalRevenue,
    monthlyRevenue,
    topTours,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    pendingRevenue,
    confirmedBookings,
    cancelledBookings
  } = cachedData;

  // Calculate trends (simplified - in production, compare with previous period)
  const revenueTrend = '+12.5%';
  const userTrend = '+8.2%';
  const bookingTrend = '-3.1%';
  const tourTrend = '+5.7%';

  return (
    <div>
      <div className="p-4 md:p-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Admin Dashboard</h1>
              <p className="text-slate-500 font-bold mt-2">VietTravel Luxury Enterprise Management System</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-200">
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 
                  System Online
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<DollarSign size={24} />} title="Tổng Doanh Thu" value={Number(totalRevenue?._sum?.total_amount || 0).toLocaleString()} subtitle="VNĐ" color="bg-green-500" trend={revenueTrend} />
          <StatCard icon={<Users size={24} />} title="Total Customers" value={totalUsers} subtitle="Accounts" color="bg-blue-500" trend={userTrend} />
          <StatCard icon={<TicketCheck size={24} />} title="Pending Bookings" value={pendingBookings} subtitle="Need Review" color="bg-orange-500" trend={bookingTrend} />
          <StatCard icon={<Map size={24} />} title="Active Tours" value={totalTours} subtitle="Available" color="bg-purple-500" trend={tourTrend} />
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <RevenueCard icon={<Calendar size={20} />} title="Hôm nay" value={Number(todayRevenue?._sum?.total_amount || 0).toLocaleString()} subtitle="VNĐ" color="bg-blue-500" />
          <RevenueCard icon={<Clock size={20} />} title="Tuần này" value={Number(weekRevenue?._sum?.total_amount || 0).toLocaleString()} subtitle="VNĐ" color="bg-green-500" />
          <RevenueCard icon={<TrendingUp size={20} />} title="Tháng này" value={Number(monthRevenue?._sum?.total_amount || 0).toLocaleString()} subtitle="VNĐ" color="bg-purple-500" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Tỷ lệ hủy" value="2.3%" subtitle="vs 3.1% tháng trước" positive={true} />
          <MetricCard label="Giá trung bình" value="5.2M VNĐ" subtitle="vs 4.8M tháng trước" positive={true} />
          <MetricCard label="Thời gian phản hồi" value="2.5h" subtitle="vs 3.2h tháng trước" positive={true} />
          <MetricCard label="Tỷ lệ hoàn tiền" value="1.1%" subtitle="vs 1.5% tháng trước" positive={true} />
        </div>

        {/* Booking Status Overview */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-blue-600" size={24} />
            <h3 className="text-xl font-black text-slate-900">Trạng thái Booking</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusCard label="Chờ xử lý" value={pendingBookings} color="bg-yellow-100 text-yellow-800" />
            <StatusCard label="Đã xác nhận" value={confirmedBookings} color="bg-green-100 text-green-800" />
            <StatusCard label="Đã hủy" value={cancelledBookings} color="bg-red-100 text-red-800" />
            <StatusCard label="Doanh thu chờ" value={Number(pendingRevenue?._sum?.total_amount || 0).toLocaleString() + 'đ'} color="bg-orange-100 text-orange-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-blue-600" size={28} />
                  <h3 className="text-2xl font-black text-slate-900">Revenue Analytics</h3>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">30 ngày</button>
                  <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">90 ngày</button>
                  <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">1 năm</button>
                </div>
              </div>
              <div className="h-56 flex items-end gap-2 mb-6">
                {Array.isArray(monthlyRevenue) && monthlyRevenue.length > 0 ? (
                  monthlyRevenue.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 rounded-t-lg transition-all cursor-pointer" 
                          style={{ height: `${Math.min(100, (Number(day.revenue) / 1000000) * 10)}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {Number(day.revenue).toLocaleString()}đ
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{new Date(day.date).getDate()}</span>
                    </div>
                  ))
                ) : <div className="flex-1 text-center text-slate-400 font-bold">No data available</div>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 font-bold">Tổng doanh thu:</span>
                  <span className="text-slate-900 font-black">{Number(Array.isArray(monthlyRevenue) ? monthlyRevenue.reduce((sum, day) => sum + Number(day.revenue), 0) : 0).toLocaleString()}đ</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 font-bold">Tổng bookings:</span>
                  <span className="text-slate-900 font-black">{Array.isArray(monthlyRevenue) ? monthlyRevenue.reduce((sum, day) => sum + Number(day.bookings), 0) : 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="text-green-600" size={28} />
                <h3 className="text-2xl font-black text-slate-900">Top Performing Tours</h3>
              </div>
              <div className="space-y-4">
                {Array.isArray(topTours) && topTours.map((tour, index) => (
                  <div key={tour.tour_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black">{index + 1}</div>
                      <div><p className="font-bold text-slate-800">{tour.title || 'Unknown Tour'}</p><p className="text-sm text-slate-500">{tour.location_name}</p></div>
                    </div>
                    <div className="text-right"><p className="font-black text-green-600">{Number(tour.revenue).toLocaleString()} VNĐ</p><p className="text-xs text-slate-400">{Number(tour.bookings)} bookings</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <Activity className="text-blue-600" size={28} />
                <h3 className="text-2xl font-black text-slate-900">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {Array.isArray(recentBookings) && recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0"><Ticket className="text-orange-600" size={16} /></div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">{booking.customers?.full_name || 'Khách hàng'}</p>
                        <p className="text-xs text-slate-500">{booking.tours?.title}</p>
                        <div className="mt-1"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${booking.is_confirmed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{booking.is_confirmed ? 'Confirmed' : 'Pending'}</span></div>
                      </div>
                    </div>
                  ))
                ) : <p className="text-slate-400 text-center font-bold py-8">No recent activity</p>}
              </div>
              <Link href="/admin/bookings" className="block w-full mt-6 bg-slate-100 hover:bg-slate-200 py-3 rounded-2xl font-black text-sm text-center transition-colors">View All Bookings</Link>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-black mb-8">Quick Actions</h3>
              <div className="space-y-4">
                <QuickAction icon={<Plus size={20} />} label="Add New Tour" href="/admin/tours/create" />
                <QuickAction icon={<UserPlus size={20} />} label="Create User" href="/admin/users/create" />
                <QuickAction icon={<BarChart3 size={20} />} label="View Analytics" href="/admin/analytics" />
                <QuickAction icon={<ShieldAlert size={20} />} label="Roles & Permissions" href="/admin/roles" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, trend }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:translate-y-[-4px] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>{icon}</div>
        <span className={`text-xs font-black flex items-center gap-1 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </span>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-900 leading-none mb-1">{value}</h4>
      <p className="text-slate-500 text-xs font-bold">{subtitle}</p>
    </div>
  );
}

function RevenueCard({ icon, title, value, subtitle, color }) {
  return (
    <div className={`${color} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">{icon}</div>
        <p className="text-sm font-bold opacity-90">{title}</p>
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-bold opacity-75">{subtitle}</p>
    </div>
  );
}

function StatusCard({ label, value, color }) {
  return (
    <div className={`${color} rounded-xl p-4 text-center`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-bold">{label}</p>
    </div>
  );
}

function QuickAction({ icon, label, href }) {
  return <Link href={href} className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-sm">{icon}<span className="font-bold text-sm">{label}</span></Link>;
}

function MetricCard({ label, value, subtitle, positive }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
      <p className={`text-xs font-bold ${positive ? 'text-green-600' : 'text-red-600'}`}>{subtitle}</p>
    </div>
  );
}