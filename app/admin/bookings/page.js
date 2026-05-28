import { prisma } from "@/lib/prisma";
import { User, MapPin, Search, Filter, Download, Eye, CheckCircle, Calendar, X } from "lucide-react";
import Link from "next/link";
import { cache } from "@/lib/cache";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function ManageBookings({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "";
  const paymentStatus = params.paymentStatus || "";
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";
  const sortBy = params.sortBy || "date";
  const sortOrder = params.sortOrder || "desc";
  const page = parseInt(params.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause with advanced filters
  const where = {
    ...(query && {
      OR: [
        { customers: { full_name: { contains: query, mode: 'insensitive' } } },
        { tours: { title: { contains: query, mode: 'insensitive' } } },
        { customers: { phone_number: { contains: query } } },
        { customers: { email: { contains: query, mode: 'insensitive' } } }
      ]
    }),
    ...(status && {
      status: status
    }),
    ...(paymentStatus && {
      booking_payments: {
        some: {
          payment_status: paymentStatus
        }
      }
    }),
    ...(startDate && {
      start_date: { gte: new Date(startDate) }
    }),
    ...(endDate && {
      end_date: { lte: new Date(endDate) }
    })
  };

  // Build order clause
  const orderBy = {};
  if (sortBy === 'date') {
    orderBy.start_date = sortOrder;
  } else if (sortBy === 'amount') {
    orderBy.total_amount = sortOrder;
  } else if (sortBy === 'passengers') {
    orderBy.total_passengers = sortOrder;
  } else {
    orderBy.id = sortOrder;
  }

  // Cache key for bookings
  const cacheKey = `admin_bookings:${JSON.stringify({ query, status, paymentStatus, startDate, endDate, sortBy, sortOrder, page, limit })}`;
  
  // Try to get from cache first
  let [bookings, totalCount, statusCounts] = cache.get(cacheKey);
  
  if (!bookings) {
    [bookings, totalCount, statusCounts] = await Promise.all([
      prisma.bookings.findMany({
        where,
        include: {
          customers: { select: { full_name: true, phone_number: true, email: true } },
          tours: { select: { title: true, location_name: true } },
          accounts: { select: { full_name: true } },
          booking_payments: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.bookings.count({ where }),
      prisma.bookings.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);
    
    // Cache for 2 minutes
    cache.set(cacheKey, [bookings, totalCount, statusCounts], 120);
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">📅 Quản lý Bookings</h1>
              <p className="text-blue-100">Tổng cộng {totalCount} đặt tour</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const csv = [
                    ['ID', 'Khách hàng', 'SĐT', 'Email', 'Tour', 'Ngày đi', 'Ngày về', 'Tổng tiền', 'Đã thanh toán', 'Trạng thái'],
                    ...bookings.map(b => [
                      b.id,
                      b.customers?.full_name || '',
                      b.customers?.phone_number || '',
                      b.customers?.email || '',
                      b.tours?.title || '',
                      new Date(b.start_date).toLocaleDateString('vi-VN'),
                      new Date(b.end_date).toLocaleDateString('vi-VN'),
                      Number(b.total_amount),
                      Number(b.paid_amount),
                      b.status
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
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

        {/* Advanced Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900">Bộ lọc</h3>
            {(query || status || paymentStatus || startDate || endDate) && (
              <Link 
                href="/admin/bookings"
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
                  placeholder="Tìm kiếm theo tên, tour, SĐT, email..."
                  defaultValue={query}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select 
                name="status"
                defaultValue={status}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="AWAITING_PAYMENT">Chờ thanh toán</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
              </select>
              <select 
                name="paymentStatus"
                defaultValue={paymentStatus}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
              >
                <option value="">Tất cả thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="completed">Đã thanh toán</option>
                <option value="failed">Thất bại</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  defaultValue={startDate}
                  className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
                />
                <input
                  type="date"
                  name="endDate"
                  defaultValue={endDate}
                  className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
                />
              </div>
              <select 
                name="sortBy"
                defaultValue={sortBy}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
              >
                <option value="date">Sắp xếp theo ngày</option>
                <option value="amount">Sắp xếp theo tiền</option>
                <option value="passengers">Sắp xếp theo khách</option>
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

          {/* Active Filters */}
          {(query || status || paymentStatus || startDate || endDate) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 flex-wrap">
              <span className="text-sm font-bold text-slate-500">Đang lọc:</span>
              {query && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  Tìm: {query}
                  <Link href={`?status=${status}&paymentStatus=${paymentStatus}&startDate=${startDate}&endDate=${endDate}&sortBy=${sortBy}`} className="hover:text-blue-600">
                    <X size={12} />
                  </Link>
                </span>
              )}
              {status && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  Trạng thái: {status}
                  <Link href={`?q=${query}&paymentStatus=${paymentStatus}&startDate=${startDate}&endDate=${endDate}&sortBy=${sortBy}`} className="hover:text-blue-600">
                    <X size={12} />
                  </Link>
                </span>
              )}
              {paymentStatus && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  Thanh toán: {paymentStatus}
                  <Link href={`?q=${query}&status=${status}&startDate=${startDate}&endDate=${endDate}&sortBy=${sortBy}`} className="hover:text-blue-600">
                    <X size={12} />
                  </Link>
                </span>
              )}
              {startDate && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  Từ: {startDate}
                  <Link href={`?q=${query}&status=${status}&paymentStatus=${paymentStatus}&endDate=${endDate}&sortBy=${sortBy}`} className="hover:text-blue-600">
                    <X size={12} />
                  </Link>
                </span>
              )}
              {endDate && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  Đến: {endDate}
                  <Link href={`?q=${query}&status=${status}&paymentStatus=${paymentStatus}&startDate=${startDate}&sortBy=${sortBy}`} className="hover:text-blue-600">
                    <X size={12} />
                  </Link>
                </span>
              )}
            </div>
          )}

          {/* Status Pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {statusCounts.map(({ status, _count }) => (
              <Link
                key={status}
                href={`?status=${status}`}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                  params.status === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status}: {_count.id}
              </Link>
            ))}
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-blue-800">
              Đã chọn <span id="selected-count">0</span> bookings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
              <CheckCircle size={16} />
              Xác nhận
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
              <X size={16} />
              Hủy
            </button>
            <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
              <Download size={16} />
              Xuất CSV
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 font-bold text-lg">Không tìm thấy booking nào</p>
                <Link href="/admin/bookings" className="text-blue-600 font-bold hover:underline">
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
                  <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Khách hàng</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Tour</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Ngày đi</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Tổng tiền</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thanh toán</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bookings.map((booking) => {
                  const statusColors = {
                    PENDING: 'bg-yellow-100 text-yellow-800',
                    AWAITING_PAYMENT: 'bg-orange-100 text-orange-800',
                    CONFIRMED: 'bg-green-100 text-green-800',
                    COMPLETED: 'bg-blue-100 text-blue-800',
                    CANCELLED: 'bg-red-100 text-red-800',
                    REFUNDED: 'bg-purple-100 text-purple-800'
                  };
                  
                  const statusLabels = {
                    PENDING: 'Chờ xử lý',
                    AWAITING_PAYMENT: 'Chờ thanh toán',
                    CONFIRMED: 'Đã xác nhận',
                    COMPLETED: 'Hoàn thành',
                    CANCELLED: 'Đã hủy',
                    REFUNDED: 'Đã hoàn tiền'
                  };

                  const paymentProgress = (Number(booking.paid_amount) / Number(booking.total_amount)) * 100;

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900 font-medium">#{booking.id}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-sm">{booking.customers?.full_name || 'N/A'}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <User size={12} />
                            {booking.customers?.phone_number || 'N/A'}
                          </p>
                          {booking.customers?.email && (
                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{booking.customers.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{booking.tours?.title || 'N/A'}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <MapPin size={12} />
                            {booking.tours?.location_name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 font-medium">
                            {new Date(booking.start_date).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-xs text-slate-400">
                            → {new Date(booking.end_date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-green-600 text-sm">
                          {Number(booking.total_amount).toLocaleString()}đ
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-xs ${
                              paymentProgress >= 100
                                ? 'text-green-600'
                                : paymentProgress >= 50
                                ? 'text-blue-600'
                                : 'text-orange-600'
                            }`}>
                              {Math.round(paymentProgress)}%
                            </span>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  paymentProgress >= 100
                                    ? 'bg-green-500'
                                    : paymentProgress >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-orange-500'
                                }`}
                                style={{ width: `${Math.min(100, paymentProgress)}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-slate-400">
                            {Number(booking.paid_amount).toLocaleString()}đ / {Number(booking.total_amount).toLocaleString()}đ
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          statusColors[booking.status] || 'bg-slate-100 text-slate-800'
                        }`}>
                          {statusLabels[booking.status] || booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Link 
                            href={`/tour/${booking.tour_id}`}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                            title="Xem chi tiết tour"
                          >
                            <Eye size={14} />
                          </Link>
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={async () => {
                                if (confirm(`Xác nhận booking của ${booking.customers.full_name}?`)) {
                                  try {
                                    await fetch(`/api/bookings/${booking.id}/confirm`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ confirm: true })
                                    });
                                    window.location.reload();
                                  } catch {
                                    alert('Lỗi xác nhận booking');
                                  }
                                }
                              }}
                              className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-colors"
                              title="Xác nhân booking"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} bookings
              </div>
              <select 
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-600"
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value);
                  window.location.href = `?page=1&limit=${newLimit}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}${paymentStatus ? `&paymentStatus=${paymentStatus}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`;
                }}
              >
                <option value="10">10/trang</option>
                <option value="20" selected>20/trang</option>
                <option value="50">50/trang</option>
                <option value="100">100/trang</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Link 
                href={`?page=1${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}${paymentStatus ? `&paymentStatus=${paymentStatus}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 1}
              >
                Đầu
              </Link>
              {page > 1 && (
                <Link 
                  href={`?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}${paymentStatus ? `&paymentStatus=${paymentStatus}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`}
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
                  href={`?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}${paymentStatus ? `&paymentStatus=${paymentStatus}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                  className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sau
                </Link>
              )}
              <Link 
                href={`?page=${totalPages}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}${paymentStatus ? `&paymentStatus=${paymentStatus}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`}
                className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === totalPages}
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