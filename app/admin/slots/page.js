import { prisma } from "@/lib/prisma";
import { MapPin, Calendar, Users, AlertTriangle, CheckCircle, Clock, Search, Filter } from "lucide-react";
import Link from "next/link";
import { cache } from "@/lib/cache";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function SlotManagement({ searchParams }) {
  const params = await searchParams;
  const tourId = params.tourId ? parseInt(params.tourId) : null;
  const status = params.status || "";
  const page = parseInt(params.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    ...(tourId && { tour_id: tourId }),
    ...(status && {
      available_slots: status === 'available' ? { gt: 0 } : { lte: 0 }
    })
  };

  // Cache key for schedules
  const schedulesCacheKey = `admin_slots:${JSON.stringify({ tourId, status, page, limit })}`;
  let [schedules, totalCount] = cache.get(schedulesCacheKey);
  
  // Cache key for tours filter (separate cache)
  const toursCacheKey = 'admin_slots_tours';
  let tours = cache.get(toursCacheKey);
  
  if (!schedules) {
    [schedules, totalCount] = await Promise.all([
      prisma.departure_schedules.findMany({
        where: {
          ...where,
          is_active: true
        },
        include: {
          tours: {
            select: {
              id: true,
              title: true,
              location_name: true,
              max_participants: true
            }
          },
          bookings: {
            where: { status: { not: 'CANCELLED' } },
            select: { total_passengers: true }
          }
        },
        orderBy: { departure_date: 'asc' },
        skip,
        take: limit
      }),
      prisma.departure_schedules.count({
        where: {
          ...where,
          is_active: true
        }
      })
    ]);
    
    cache.set(schedulesCacheKey, [schedules, totalCount], 300);
  }
  
  if (!tours) {
    tours = await prisma.tours.findMany({
      where: { is_active: true, is_deleted: false },
      select: { id: true, title: true, location_name: true },
      orderBy: { title: 'asc' }
    });
    
    cache.set(toursCacheKey, tours, 600); // Cache tours for 10 minutes
  }

  const totalPages = Math.ceil(totalCount / limit);

  // Calculate slot availability
  const schedulesWithAvailability = schedules.map(schedule => {
    const totalBooked = schedule.bookings.reduce((sum, b) => sum + b.total_passengers, 0);
    const availableSlots = schedule.tours.max_participants - totalBooked;
    const utilizationRate = (totalBooked / schedule.tours.max_participants) * 100;
    
    return {
      ...schedule,
      availableSlots,
      totalBooked,
      utilizationRate,
      isFull: availableSlots <= 0,
      isLow: availableSlots <= 5 && availableSlots > 0,
      isHigh: utilizationRate >= 80
    };
  });

  return (
    <div>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">🎯 Quản lý Slot</h1>
              <p className="text-blue-100">Tổng cộng {totalCount} lịch khởi hành</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900">Bộ lọc</h3>
            {(tourId || status) && (
              <Link 
                href="/admin/slots"
                className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
              >
                <Filter size={14} />
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
                  placeholder="Tìm kiếm tour..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select 
                name="tourId"
                defaultValue={tourId || ""}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
              >
                <option value="">Tất cả tour</option>
                {tours?.map(tour => (
                  <option key={tour.id} value={tour.id}>{tour.title}</option>
                ))}
              </select>
              <select 
                name="status"
                defaultValue={status}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="available">Còn chỗ</option>
                <option value="full">Hết chỗ</option>
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

          {/* Status Quick Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Link href="/admin/slots" className="px-4 py-2 rounded-full text-xs font-bold transition-colors bg-blue-600 text-white">
              Tất cả ({totalCount})
            </Link>
            <Link href="?status=available" className="px-4 py-2 rounded-full text-xs font-bold transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200">
              Còn chỗ ({schedulesWithAvailability.filter(s => !s.isFull).length})
            </Link>
            <Link href="?status=full" className="px-4 py-2 rounded-full text-xs font-bold transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200">
              Hết chỗ ({schedulesWithAvailability.filter(s => s.isFull).length})
            </Link>
            <Link href="?status=low" className="px-4 py-2 rounded-full text-xs font-bold transition-colors bg-orange-100 text-orange-700 hover:bg-orange-200">
              Sắp hết ({schedulesWithAvailability.filter(s => s.isLow).length})
            </Link>
          </div>
        </div>

        {/* Slot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedulesWithAvailability.map((schedule) => (
            <div key={schedule.id} className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${
              schedule.isFull ? 'border-red-200' : schedule.isLow ? 'border-orange-200' : schedule.isHigh ? 'border-green-200' : 'border-slate-200'
            }`}>
              <div className={`p-6 ${schedule.isFull ? 'bg-red-50' : schedule.isLow ? 'bg-orange-50' : schedule.isHigh ? 'bg-green-50' : 'bg-slate-50'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">{schedule.tours.title}</h3>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <MapPin size={14} />
                      {schedule.tours.location_name}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    schedule.isFull ? 'bg-red-500 text-white' : schedule.isLow ? 'bg-orange-500 text-white' : schedule.isHigh ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {schedule.isFull ? <AlertTriangle size={20} /> : schedule.isLow ? <Clock size={20} /> : schedule.isHigh ? <CheckCircle size={20} /> : <Users size={20} />}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <Calendar size={16} />
                  <span className="font-bold">{new Date(schedule.departure_date).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">{schedule.availableSlots}</p>
                    <p className="text-xs text-slate-600">Chỗ trống</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">{schedule.totalBooked}</p>
                    <p className="text-xs text-slate-600">Đã đặt</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Tỷ lệ lấp đầy</span>
                    <span className="font-bold">{schedule.utilizationRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        schedule.utilizationRate >= 80 ? 'bg-green-500' : schedule.utilizationRate >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(schedule.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Tổng: {schedule.tours.max_participants} chỗ
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/tours/${schedule.tour_id}`}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded-lg font-bold text-center transition-colors"
                  >
                    Xem tour
                  </Link>
                  {schedule.isLow && (
                    <button className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-600 py-2 rounded-lg font-bold transition-colors">
                      Cảnh báo
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} lịch
            </div>
            <select 
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-600"
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                window.location.href = `?page=1&limit=${newLimit}${tourId ? `&tourId=${tourId}` : ''}${status ? `&status=${status}` : ''}`;
              }}
            >
              <option value="10">10/trang</option>
              <option value="20" selected>20/trang</option>
              <option value="50">50/trang</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href={`?page=1${tourId ? `&tourId=${tourId}` : ''}${status ? `&status=${status}` : ''}`}
              className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Đầu
            </Link>
            {page > 1 && (
              <Link 
                href={`?page=${page - 1}${tourId ? `&tourId=${tourId}` : ''}${status ? `&status=${status}` : ''}`}
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
                href={`?page=${page + 1}${tourId ? `&tourId=${tourId}` : ''}${status ? `&status=${status}` : ''}`}
                className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sau
              </Link>
            )}
            <Link 
              href={`?page=${totalPages}${tourId ? `&tourId=${tourId}` : ''}${status ? `&status=${status}` : ''}`}
              className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cuối
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
