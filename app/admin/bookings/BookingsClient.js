'use client';

import * as XLSX from 'xlsx';
import { User, MapPin, Search, Filter, Download, Eye, CheckCircle, Calendar, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingsClient({ bookings = [], totalCount = 0, statusCounts = [], searchParams }) {
  const router = useRouter();
  const { query, status, paymentStatus, startDate, endDate, sortBy, page = 1, limit = 20, skip = 0, totalPages = 1 } = searchParams || {};

  // ==================== EXPORT EXCEL - AN TOÀN ====================
  const handleExportExcel = () => {
    if (!bookings || bookings.length === 0) {
      alert("Không có dữ liệu booking để xuất Excel!");
      return;
    }

    try {
      const dataToExport = bookings.map(b => ({
        'ID': b.id || '',
        'Khách hàng': b.customers?.full_name || 'N/A',
        'SĐT': b.customers?.phone_number || 'N/A',
        'Email': b.customers?.email || 'N/A',
        'Tour': b.tours?.title || 'N/A',
        'Địa điểm': b.tours?.location_name || 'N/A',
        'Ngày đi': b.start_date ? new Date(b.start_date).toLocaleDateString('vi-VN') : 'N/A',
        'Ngày về': b.end_date ? new Date(b.end_date).toLocaleDateString('vi-VN') : 'N/A',
        'Tổng tiền': Number(b.total_amount || 0),
        'Đã thanh toán': Number(b.paid_amount || 0),
        'Trạng thái': b.status || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Điều chỉnh độ rộng cột
      worksheet['!cols'] = [
        { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 30 },
        { wch: 45 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách Bookings");

      const filename = `Bookings_VietTravel_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Export Excel error:', error);
      alert('Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại!');
    }
  };

  // ==================== XÁC NHẬN BOOKING ====================
  const handleConfirmBooking = async (booking) => {
    if (!booking?.customers?.full_name) {
      alert("Không tìm thấy thông tin khách hàng!");
      return;
    }

    if (confirm(`Xác nhận booking của ${booking.customers.full_name}?`)) {
      try {
        const response = await fetch(`/api/bookings/${booking.id}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirm: true })
        });

        if (response.ok) {
          alert('Đã xác nhận booking thành công!');
          window.location.reload();
        } else {
          alert('Xác nhận thất bại. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error(error);
        alert('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black mb-2">📅 Quản lý Bookings</h1>
            <p className="text-blue-100">Tổng cộng {totalCount.toLocaleString()} đặt tour</p>
          </div>
          <button 
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg"
          >
            <Download size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
        <form className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900">Bộ lọc</h3>
          {(query || status || paymentStatus || startDate || endDate) && (
            <Link href="/admin/bookings" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
              <X size={14} /> Xóa tất cả
            </Link>
          )}
        </form>

        <form className="flex flex-col lg:flex-row gap-4" action="/admin/bookings">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                name="q"
                placeholder="Tìm theo tên khách, tour, SĐT, email..."
                defaultValue={query}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select name="status" defaultValue={status} className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all">
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="AWAITING_PAYMENT">Chờ thanh toán</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>

            <select name="paymentStatus" defaultValue={paymentStatus} className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all">
              <option value="">Tất cả thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="completed">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
            </select>

            <div className="flex gap-2">
              <input type="date" name="startDate" defaultValue={startDate} className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input type="date" name="endDate" defaultValue={endDate} className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>

            <select name="sortBy" defaultValue={sortBy} className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all">
              <option value="date">Sắp xếp theo ngày</option>
              <option value="amount">Sắp xếp theo tiền</option>
              <option value="passengers">Sắp xếp theo khách</option>
            </select>

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2">
              <Filter size={18} /> Lọc
            </button>
          </div>
        </form>

        {/* Active Filters & Status Pills */}
        {(query || status || paymentStatus || startDate || endDate) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 flex-wrap">
            <span className="text-sm font-bold text-slate-500">Đang lọc:</span>
            {query && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">Tìm: {query}</span>}
            {status && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">Trạng thái: {status}</span>}
          </div>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          {statusCounts.map(({ status: s, _count }) => (
            <Link
              key={s}
              href={`?status=${s}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {s}: {_count.id}
            </Link>
          ))}
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
              <Link href="/admin/bookings" className="text-blue-600 font-bold hover:underline">Xóa bộ lọc</Link>
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
                    const paymentProgress = booking.total_amount 
                      ? (Number(booking.paid_amount) / Number(booking.total_amount)) * 100 
                      : 0;

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

                    return (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></td>
                        <td className="px-4 py-4 text-sm text-slate-900 font-medium">#{booking.id}</td>
                        
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-800 text-sm">{booking.customers?.full_name || 'N/A'}</p>
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <User size={12} />{booking.customers?.phone_number || 'N/A'}
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
                              <MapPin size={12} />{booking.tours?.location_name || 'N/A'}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600 font-medium">
                              {booking.start_date ? new Date(booking.start_date).toLocaleDateString('vi-VN') : 'N/A'}
                            </p>
                            <p className="text-xs text-slate-400">
                              → {booking.end_date ? new Date(booking.end_date).toLocaleDateString('vi-VN') : 'N/A'}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-bold text-green-600 text-sm">
                            {Number(booking.total_amount || 0).toLocaleString()}đ
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-xs ${paymentProgress >= 100 ? 'text-green-600' : paymentProgress >= 50 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {Math.round(paymentProgress)}%
                              </span>
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${paymentProgress >= 100 ? 'bg-green-500' : paymentProgress >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                                  style={{ width: `${Math.min(100, paymentProgress)}%` }} 
                                />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400">
                              {Number(booking.paid_amount || 0).toLocaleString()}đ / {Number(booking.total_amount || 0).toLocaleString()}đ
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[booking.status] || 'bg-slate-100 text-slate-800'}`}>
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
                                onClick={() => handleConfirmBooking(booking)} 
                                className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-colors" 
                                title="Xác nhận booking"
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
                  defaultValue={limit}
                  onChange={(e) => {
                    const newLimit = e.target.value;
                    router.push(`?page=1&limit=${newLimit}${query ? `&q=${query}` : ''}${status ? `&status=${status}` : ''}`);
                  }}
                >
                  <option value="10">10/trang</option>
                  <option value="20">20/trang</option>
                  <option value="50">50/trang</option>
                  <option value="100">100/trang</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Link href="?page=1" className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50">Đầu</Link>
                {page > 1 && <Link href={`?page=${page - 1}`} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50">Trước</Link>}
                <span className="px-3 py-2 text-sm font-bold text-slate-700">Trang {page} / {totalPages}</span>
                {page < totalPages && <Link href={`?page=${page + 1}`} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50">Sau</Link>}
                <Link href={`?page=${totalPages}`} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50">Cuối</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}