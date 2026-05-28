'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 BƯỚC 1: HÀM KHAI BÁO PHẢI NẰM TRÊN CÙNG
  const fetchBookings = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        setError('Bạn cần đăng nhập để xem lịch sử đặt tour');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(`/api/bookings?user_id=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.error || 'Không thể tải lịch sử đặt tour');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 BƯỚC 2: USEEFFECT GỌI HÀM NẰM Ở DƯỚI
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
      case 'awaiting_payment':
      case 'deposit_paid':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'awaiting_payment':
        return 'Chờ thanh toán';
      case 'deposit_paid':
        return 'Đã đặt cọc';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 text-red-700 font-bold">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-12 text-center">
        <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
        <h3 className="text-xl font-black text-slate-800 mb-2">Chưa có đặt tour nào</h3>
        <p className="text-slate-600">Bạn chưa đặt tour nào. Hãy khám phá và đặt tour ngay!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-800 mb-6">Lịch sử đặt tour</h2>
      
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-blue-300 transition-all"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Tour Image */}
            {booking.tourImage && (
              <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={booking.tourImage}
                  alt={booking.tourTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Booking Details */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">{booking.tourTitle}</h3>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin size={14} />
                    <span>{booking.location}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full border-2 text-xs font-black flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  <span>{getStatusText(booking.status)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 font-bold mb-1">Ngày khởi hành</p>
                  <p className="text-slate-800 font-black">{new Date(booking.startDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold mb-1">Ngày kết thúc</p>
                  <p className="text-slate-800 font-black">{new Date(booking.endDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold mb-1">Tổng tiền</p>
                  <p className="text-blue-600 font-black">{booking.amount.toLocaleString()}đ</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold mb-1">Đã thanh toán</p>
                  <p className="text-green-600 font-black">{booking.paidAmount?.toLocaleString() || 0}đ</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Users size={14} />
                  <span>Khách hàng: {booking.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <span>Điện thoại: {booking.phone}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
                Chi tiết <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}