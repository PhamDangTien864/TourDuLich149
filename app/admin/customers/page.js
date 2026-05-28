import { prisma } from "@/lib/prisma";
import { User, Phone, Mail, Search, Filter, Eye, Edit, Trash2, Calendar, Download, X, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import { cache } from "@/lib/cache";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function ManageCustomers({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const sortBy = params.sortBy || "created";
  const sortOrder = params.sortOrder || "desc";
  const page = parseInt(params.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    is_deleted: false,
    ...(query && {
      OR: [
        { full_name: { contains: query, mode: 'insensitive' } },
        { phone_number: { contains: query } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    })
  };

  // Build order clause
  const orderBy = {};
  if (sortBy === 'name') {
    orderBy.full_name = sortOrder;
  } else if (sortBy === 'created') {
    orderBy.created_at = sortOrder;
  } else {
    orderBy.id = sortOrder;
  }

  // Cache key for customers
  const cacheKey = `admin_customers:${JSON.stringify({ query, sortBy, sortOrder, page, limit })}`;
  let [customers, totalCount, customerStats] = cache.get(cacheKey);
  
  if (!customers) {
    [customers, totalCount] = await Promise.all([
      prisma.customers.findMany({
        where,
        include: {
          bookings: {
            select: { id: true, total_amount: true, status: true },
            orderBy: { created_at: 'desc' },
            take: 5
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.customers.count({ where })
    ]);

    // Get customer statistics (separate cache for stats)
    const statsCacheKey = 'admin_customers_stats';
    customerStats = cache.get(statsCacheKey);
    
    if (!customerStats) {
      const [totalBookings, totalSpent, topCustomers] = await Promise.all([
        prisma.bookings.count({
          where: { customers: { is_deleted: false } }
        }),
        prisma.bookings.aggregate({
          _sum: { total_amount: true },
          where: { customers: { is_deleted: false } }
        }),
        prisma.customers.findMany({
          where: { is_deleted: false },
          include: {
            bookings: {
              select: { total_amount: true }
            }
          },
          take: 5
        })
      ]);

      customerStats = {
        totalBookings,
        totalSpent: Number(totalSpent._sum.total_amount || 0),
        topCustomers
      };

      cache.set(statsCacheKey, customerStats, 600); // Cache stats for 10 minutes
    }

    cache.set(cacheKey, [customers, totalCount, customerStats], 300);
  }

  const totalPages = Math.ceil(totalCount / limit);

  // Calculate customer lifetime value
  const customersWithStats = customers.map(customer => {
    const totalBookings = customer.bookings.length;
    const totalSpent = customer.bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
    const lastBooking = customer.bookings[0];
    
    return {
      ...customer,
      totalBookings,
      totalSpent,
      lastBookingDate: lastBooking ? new Date(lastBooking.created_at).toLocaleDateString('vi-VN') : 'N/A'
    };
  });

  return (
    <div>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">👥 Quản lý Khách hàng</h1>
              <p className="text-blue-100">Tổng cộng {totalCount} khách hàng trong hệ thống</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const csv = [
                    ['ID', 'Họ tên', 'SĐT', 'Email', 'Ngày tham gia', 'Tổng bookings', 'Tổng chi tiêu', 'Booking gần nhất'],
                    ...customersWithStats.map(c => [
                      c.id,
                      c.full_name,
                      c.phone_number || '',
                      c.email || '',
                      c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : 'N/A',
                      c.totalBookings,
                      c.totalSpent,
                      c.lastBookingDate
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Xuất CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Award size={20} />} title="Tổng Bookings" value={customerStats.totalBookings} subtitle="Đặt tour" color="bg-blue-500" />
          <StatCard icon={<TrendingUp size={20} />} title="Tổng Chi Tiêu" value={customerStats.totalSpent.toLocaleString()} subtitle="VNĐ" color="bg-green-500" />
          <StatCard icon={<User size={20} />} title="Khách Hàng VIP" value="5" subtitle="Top khách" color="bg-purple-500" />
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900">Bộ lọc</h3>
            {query && (
              <Link 
                href="/admin/customers"
                className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
              >
                <X size={14} />
                Xóa tất cả
              </Link>
            )}
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="q"
                  placeholder="Tìm kiếm theo tên, SĐT, hoặc email..."
                  defaultValue={query}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select 
                name="sortBy"
                defaultValue={sortBy}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
              >
                <option value="created">Sắp xếp theo ngày</option>
                <option value="name">Sắp xếp theo tên</option>
              </select>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <Filter size={18} />
                Lọc
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {customersWithStats.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 font-bold text-lg">Không tìm thấy khách hàng nào</p>
                <Link href="/admin/customers" className="text-blue-600 font-bold hover:underline">
                  Xóa bộ lọc
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider w-12">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                      </th>
                      <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">ID</th>
                      <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thông tin</th>
                      <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Liên hệ</th>
                      <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Ngày tham gia</th>
                      <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thống kê</th>
                      <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {customersWithStats.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-900 font-medium">#{customer.id}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="text-blue-600" size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{customer.full_name}</p>
                              <p className="text-xs text-slate-500">
                                {customer.is_male ? 'Nam' : 'Nữ'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {customer.phone_number && (
                              <p className="text-xs text-slate-600 flex items-center gap-1">
                                <Phone size={12} />
                                {customer.phone_number}
                              </p>
                            )}
                            {customer.email && (
                              <p className="text-xs text-slate-500 truncate max-w-[150px]">{customer.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600 font-medium">
                              {customer.created_at 
                                ? new Date(customer.created_at).toLocaleDateString('vi-VN')
                                : 'N/A'}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {customer.lastBookingDate}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Award size={12} className="text-blue-600" />
                              <span className="text-xs font-bold text-slate-800">{customer.totalBookings} bookings</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp size={12} className="text-green-600" />
                              <span className="text-xs font-bold text-green-600">{customer.totalSpent.toLocaleString()}đ</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={14} />
                            </Link>
                            <Link
                              href={`/admin/customers/${customer.id}/edit`}
                              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-2 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit size={14} />
                            </Link>
                            <button
                              onClick={async () => {
                                if (confirm(`Xóa khách hàng ${customer.full_name}?`)) {
                                  try {
                                    await fetch(`/api/customers/${customer.id}`, {
                                      method: 'DELETE'
                                    });
                                    window.location.reload();
                                  } catch {
                                    alert('Lỗi xóa khách hàng');
                                  }
                                }
                              }}
                              className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-600">
                    Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} khách hàng
                  </div>
                  <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-600"
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value);
                      window.location.href = `?page=1&limit=${newLimit}${query ? `&q=${encodeURIComponent(query)}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`;
                    }}
                  >
                    <option value="10">10/trang</option>
                    <option value="20" selected>20/trang</option>
                    <option value="50">50/trang</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`?page=1${query ? `&q=${encodeURIComponent(query)}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Đầu
                  </Link>
                  {page > 1 && (
                    <Link
                      href={`?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                      className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Trước
                    </Link>
                  )}
                  <span className="px-3 py-2 text-sm font-bold text-slate-700">
                    Trang {page} / {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                      className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Sau
                    </Link>
                  )}
                  <Link
                    href={`?page=${totalPages}${query ? `&q=${encodeURIComponent(query)}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cuối
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }) {
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
