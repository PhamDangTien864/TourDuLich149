'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, CreditCard, CheckCircle, Clock, XCircle, User } from 'lucide-react';
import useSWR from 'swr';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function BookingHistory() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      // Block admin from accessing customer pages
      if (user.role_id === 1) {
        window.location.href = '/admin';
        return;
      }
      setUserId(user.id);
    } else {
      window.location.href = '/login';
    }
  }, []);

  // Sử dụng SWR để fetch data, tự động quản lý cache, loading, error
  const { data, error, isLoading } = useSWR(
    userId ? `/api/bookings?user_id=${userId}` : null,
    fetcher
  );

  // BỘ LỌC SIÊU CẤP: Đã được làm gọn lại
  const bookings = data ? (
    Array.isArray(data.bookings) ? data.bookings 
    : Array.isArray(data.data) ? data.data 
    : Array.isArray(data) ? data 
    : data.bookings ? [data.bookings] 
    : []
  ) : [];

  const getStatusBadge = (isConfirmed) => {
    if (isConfirmed) {
      return (
        <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
          <CheckCircle size={14} /> Đã xác nhận
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
        <Clock size={14} /> Chờ thanh toán
      </span>
    );
  };

  if (isLoading || (!userId && !error)) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || (data && data.success === false)) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Lỗi</h2>
          <p className="text-slate-600">{error?.message || data?.error || data?.message || 'Không thể tải lịch sử đặt tour'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">
                Lịch sử đặt tour
              </h1>
              <p className="text-slate-600 font-bold text-lg">
                Xem và quản lý các tour bạn đã đặt
              </p>
            </div>
            <a
              href="/customer/me"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black transition-all shadow-sm"
            >
              <User size={20} />
              Cập nhật thông tin cá nhân
            </a>
          </div>

          {/* CHỐN SẬP: Bắt buộc phải là Array mới đếm length được */}
          {(!Array.isArray(bookings) || bookings.length === 0) ? (
            <div className="bg-slate-50 rounded-[40px] p-16 text-center border-2 border-dashed border-slate-200">
              <Calendar className="mx-auto text-slate-300 mb-6" size={64} />
              <h2 className="text-2xl font-black text-slate-400 mb-4">Chưa có đặt tour nào</h2>
              <p className="text-slate-500 mb-8">Hãy khám phá và đặt tour đầu tiên của bạn ngay!</p>
              <a
                href="/search"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all"
              >
                <MapPin size={20} />
                Khám phá tour
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            width={80}
                            height={80}
                            src={booking.tourImage || "https://images.unsplash.com/photo-1528127269322-539801943592?w=200"}
                            alt={booking.tourTitle || "Hình ảnh tour"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-black text-slate-800 mb-2">{booking.tourTitle}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm font-bold">
                            <span className="flex items-center gap-2">
                              <MapPin size={16} />
                              {booking.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar size={16} />
                              {new Date(booking.startDate || booking.start_date).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      {getStatusBadge(booking.isConfirmed || booking.status === 'CONFIRMED')}
                      <div className="text-right">
                        <p className="text-2xl font-black text-blue-600">
                          {Number(booking.amount || booking.total_amount).toLocaleString('vi-VN')}đ
                        </p>
                        {(booking.paidAmount > 0 || booking.paid_amount > 0) && (
                          <p className="text-sm text-green-600 font-bold">
                            Đã trả: {Number(booking.paidAmount || booking.paid_amount).toLocaleString('vi-VN')}đ
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-4">
                    <a
                      href={`/tour/${booking.id || booking.tour_id}`}
                      className="px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Xem chi tiết
                    </a>
                    {!(booking.isConfirmed || booking.status === 'CONFIRMED') && (
                      <a
                        href={`/payment?bookingId=${booking.id}`}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                      >
                        <CreditCard size={18} />
                        Thanh toán
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}