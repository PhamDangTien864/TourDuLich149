'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, CreditCard, CheckCircle, Clock, XCircle, User, Home, Heart, History } from 'lucide-react';
import useSWR from 'swr';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

const fetcher = (url) => fetch(url, { credentials: 'include' }).then((res) => res.json());

export default function BookingHistory() {
  // Sử dụng SWR để fetch data, tự động quản lý cache, loading, error
  const { data, error, isLoading } = useSWR(
    '/api/my-bookings',
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

  const getStatusBadge = (status, booking) => {
    const statusConfig = {
      PENDING: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Chờ xử lý', icon: Clock },
      AWAITING_PAYMENT: isPaid(booking) ? { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã thanh toán', icon: CheckCircle } : { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang chờ thanh toán', icon: Clock },
      DEPOSIT_PAID: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã cọc', icon: CheckCircle },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã xác nhận', icon: CheckCircle },
      COMPLETED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Hoàn thành', icon: CheckCircle },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy', icon: XCircle },
      REFUNDED: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Đã hoàn tiền', icon: CreditCard }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 ${config.bg} ${config.text} px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider`}>
        <Icon size={14} /> {config.label}
      </span>
    );
  };

  const isPaid = (booking) => {
    const totalAmount = Number(booking.total_amount || booking.amount || 0);
    const paidAmount = Number(booking.paid_amount || booking.paidAmount || 0);
    return paidAmount >= totalAmount && totalAmount > 0;
  };

  if (isLoading) {
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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-800 mb-8">Lịch sử đặt tour</h1>

          {/* Thanh Menu Điều Hướng (Dashboard) */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <Home size={18} /> Trang chủ
            </Link>
            <Link href="/customer/profile" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <User size={18} /> Hồ sơ cá nhân
            </Link>
            <button className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <History size={18} /> Lịch sử đặt tour
            </button>
            <Link href="/customer/favorites" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <Heart size={18} /> Tour yêu thích
            </Link>
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
                          {booking.tours?.tour_images?.[0]?.image_url ? (
                            <img
                              src={booking.tours.tour_images[0].image_url}
                              alt={booking.tours.title || "Hình ảnh tour"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src="https://images.unsplash.com/photo-1528127269322-539801943592?w=200"
                              alt="Hình ảnh tour"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-black text-slate-800 mb-2">{booking.tours?.title || booking.tourTitle}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm font-bold">
                            <span className="flex items-center gap-2">
                              <MapPin size={16} />
                              {booking.tours?.location_name || booking.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar size={16} />
                              {new Date(booking.start_date || booking.startDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status, booking)}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-blue-600">
                          {Number(booking.total_amount || booking.amount).toLocaleString('vi-VN')}đ
                        </p>
                        {(booking.paid_amount > 0 || booking.paidAmount > 0) && (
                          <p className="text-sm text-green-600 font-bold">
                            Đã trả: {Number(booking.paid_amount || booking.paidAmount).toLocaleString('vi-VN')}đ
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-4">
                    <a
                      href={`/tour/${booking.tours?.id || booking.tour_id}`}
                      className="px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Xem chi tiết
                    </a>
                    {!(booking.is_confirmed || booking.isConfirmed || booking.status === 'CONFIRMED') && !isPaid(booking) && (
                      <a
                        href={`/payment?bookingId=${booking.id}`}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                      >
                        <CreditCard size={18} />
                        Thanh toán
                      </a>
                    )}
                  </div>

                  {/* Show itinerary for paid bookings */}
                  {isPaid(booking) && booking.tours?.itinerary && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-blue-600" />
                        Lịch trình tour
                      </h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{booking.tours.itinerary}</p>
                    </div>
                  )}
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