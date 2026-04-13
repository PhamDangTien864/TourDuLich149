"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Phone, Calendar, LogOut, Package, History, Users } from 'lucide-react';
import Header from "../../components/Header";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function EmployeeProfile() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token || !userData) {
        router.push('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadUserBookings(parsedUser.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setUser(null);
      }
    };

    checkAuth();
  }, [router]);

  const loadUserBookings = async (userId) => {
    try {
      const res = await fetch(`/api/bookings?accountId=${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Vui lòng đăng nhập</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-r from-purple-600 to-slate-900 text-white rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-black mb-2">{user.name}</h1>
                <p className="text-purple-100">Nhân viên VietTravel</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="text-purple-600" size={24} />
              <h2 className="text-xl font-black text-slate-800">Thông tin cá nhân</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Họ và tên</p>
                <p className="font-bold text-slate-800">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Username</p>
                <p className="font-mono text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">@{user.username}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Vai trò</p>
                <span className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-bold">
                  Nhân viên
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-green-600" size={24} />
              <h2 className="text-xl font-black text-slate-800">Thống kê</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tổng đặt tour</span>
                <span className="text-2xl font-black text-purple-600">{bookings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Doanh thu</span>
                <span className="text-xl font-bold text-green-600">
                  {bookings.reduce((total, booking) => total + booking.amount, 0).toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tour gần nhất</span>
                <span className="text-sm text-slate-800">
                  {bookings.length > 0 ? bookings[0].tourTitle : "Chưa có"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Recent Bookings Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <History className="text-orange-600" size={24} />
              <h2 className="text-xl font-black text-slate-800">Đặt tour gần đây</h2>
            </div>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking, index) => (
                <div key={booking.id} className="border-l-4 border-purple-600 pl-4 py-3 bg-slate-50 rounded-r-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{booking.tourTitle}</p>
                      <p className="text-xs text-slate-500">{booking.location}</p>
                      <p className="text-xs text-purple-600">
                        {new Date(booking.startDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className="font-bold text-green-600 text-sm">
                      {booking.amount.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">Bạn chưa xử lý tour nào</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <a 
            href="/search"
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-blue-600" size={24} />
              <h3 className="text-lg font-black text-slate-800">Tìm tour mới</h3>
            </div>
            <p className="text-slate-600 text-sm">Tìm kiếm các tour có sẵn</p>
          </a>

          <a 
            href="/history"
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <History className="text-green-600" size={24} />
              <h3 className="text-lg font-black text-slate-800">Lịch sử</h3>
            </div>
            <p className="text-slate-600 text-sm">Xem tất cả đặt tour</p>
          </a>

          <a 
            href="/"
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-purple-600" size={24} />
              <h3 className="text-lg font-black text-slate-800">Trang chủ</h3>
            </div>
            <p className="text-slate-600 text-sm">Quay lại trang chính</p>
          </a>
        </motion.div>
      </main>
    </div>
  );
}
