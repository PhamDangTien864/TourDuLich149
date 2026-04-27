'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, CreditCard, Clock, Filter, Loader2, X, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Header from '../components/Header';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
};

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Hoàn thành'
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        router.push('/login');
        return;
      }

      const url = filterStatus === 'all' 
        ? '/api/my-bookings' 
        : `/api/my-bookings?status=${filterStatus}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error('Không thể tải danh sách booking');
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error('Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Bạn có chắc muốn hủy booking này?')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Đã hủy booking thành công');
        fetchBookings();
      } else {
        toast.error(data.error || 'Hủy booking thất bại');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error('Lỗi hệ thống');
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/invoice`);
      const data = await res.json();

      if (data.success) {
        // Create a new window with the invoice HTML
        const newWindow = window.open('', '_blank');
        newWindow.document.write(data.html);
        newWindow.document.close();
        
        // Trigger print dialog
        setTimeout(() => {
          newWindow.print();
        }, 500);
        
        toast.success('Đang tải hóa đơn...');
      } else {
        toast.error(data.error || 'Tải hóa đơn thất bại');
      }
    } catch (error) {
      console.error('Download invoice error:', error);
      toast.error('Lỗi hệ thống');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Đặt Tour Của Tôi</h1>
            <p className="text-slate-500 mt-1">Quản lý và xem lịch sử đặt tour</p>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <Filter size={20} />
            <span>Lọc</span>
          </button>
        </div>

        {showFilter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-medium text-slate-700">Trạng thái:</span>
              {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg transition ${
                    filterStatus === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status === 'all' ? 'Tất cả' : statusLabels[status]}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Chưa có booking nào</h3>
            <p className="text-slate-500 mb-6">Bạn chưa đặt tour nào. Hãy khám phá và đặt tour ngay!</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Khám Phá Tour
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto bg-slate-200">
                    {booking.tours.tour_images?.[0] ? (
                      <img
                        src={booking.tours.tour_images[0].image_url}
                        alt={booking.tours.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                        <MapPin className="text-white/50" size={48} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">
                          {booking.tours.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={16} />
                          <span>{booking.tours.location_name}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[booking.status] || statusColors.pending}`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={18} className="text-blue-500" />
                        <div>
                          <p className="text-xs text-slate-400">Ngày đi</p>
                          <p className="font-medium">{new Date(booking.start_date).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={18} className="text-blue-500" />
                        <div>
                          <p className="text-xs text-slate-400">Ngày về</p>
                          <p className="font-medium">{new Date(booking.end_date).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users size={18} className="text-blue-500" />
                        <div>
                          <p className="text-xs text-slate-400">Khách hàng</p>
                          <p className="font-medium">{booking.customers.full_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CreditCard size={18} className="text-blue-500" />
                        <div>
                          <p className="text-xs text-slate-400">Tổng tiền</p>
                          <p className="font-medium text-green-600">
                            {booking.total_amount.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500">
                        Booking ID: <span className="font-mono">#{booking.id}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(booking.id)}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-1"
                          title="Tải hóa đơn"
                        >
                          <Download size={16} />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                          >
                            Hủy Booking
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/tour/${booking.tours.id}`)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          Xem Chi Tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
