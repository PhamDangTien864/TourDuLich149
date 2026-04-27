import { prisma } from "@/lib/prisma";
import { User, MapPin, Search, Filter, Download, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function ManageBookings({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "";
  const page = parseInt(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Lấy danh sách bookings với phân trang và tìm kiếm
  const [bookings, totalCount] = await Promise.all([
    prisma.bookings.findMany({
      where: {
        ...(query && {
          OR: [
            { customers: { full_name: { contains: query } } },
            { tours: { title: { contains: query } } },
            { customers: { phone_number: { contains: query } } }
          ]
        }),
        ...(status && {
          is_confirmed: status === 'confirmed'
        })
      },
      include: {
        customers: { select: { full_name: true, phone_number: true } },
        tours: { select: { title: true, location_name: true } },
        accounts: { select: { full_name: true } }
      },
      orderBy: { start_date: 'desc' },
      skip,
      take: limit
    }),
    prisma.bookings.count({
      where: {
        ...(query && {
          OR: [
            { customers: { full_name: { contains: query } } },
            { tours: { title: { contains: query } } },
            { customers: { phone_number: { contains: query } } }
          ]
        }),
        ...(status && {
          is_confirmed: status === 'confirmed'
        })
      }
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Tính doanh thu
  const totalRevenue = await prisma.bookings.aggregate({
    _sum: { total_amount: true }
  });

  return (
    <div>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">📅 Quản lý Bookings</h1>
              <p className="text-blue-100">Tổng cộng {totalCount} đặt tour | Doanh thu: {Number(totalRevenue._sum.total_amount || 0).toLocaleString()}đ</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">
                <Download size={16} className="mr-2" />
                Xuất Excel
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="q"
                  placeholder="Tìm kiếm theo tên khách, tour, hoặc SĐT..."
                  defaultValue={query}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                name="status"
                defaultValue={status}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="pending">Chờ xác nhận</option>
              </select>
              <button className="bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 transition-colors flex items-center gap-2">
                <Filter size={18} />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Khách hàng</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Tour</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Ngày đi</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Tổng tiền</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Đã thanh toán</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">#{booking.id}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <p className="font-bold text-slate-800">{booking.customers.full_name}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <User size={14} />
                          {booking.customers.phone_number}
                        </p>
                        <p className="text-xs text-blue-600">NV: {booking.accounts.full_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">{booking.tours.title}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <MapPin size={14} />
                          {booking.tours.location_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600">
                          {new Date(booking.start_date).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-slate-400">
                          → {new Date(booking.end_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        {Number(booking.total_amount).toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          Number(booking.paid_amount) >= Number(booking.total_amount)
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}>
                          {Number(booking.paid_amount).toLocaleString()}đ
                        </span>
                        <span className="text-xs text-slate-400">
                          / {Number(booking.total_amount).toLocaleString()}đ
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.is_confirmed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.is_confirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/tour/${booking.tour_id}`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                          title="Xem chi tiết tour"
                        >
                          <Eye size={16} />
                        </Link>
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
                              } catch (error) {
                                alert('Lỗi xác nhận booking');
                              }
                            }
                          }}
                          className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-colors"
                          title="Xác nhân booking"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} bookings
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link 
                    href={`?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Trước
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`?page=${pageNum}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}`}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link 
                    href={`?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Sau
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}