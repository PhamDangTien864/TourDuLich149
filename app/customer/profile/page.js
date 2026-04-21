'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, LogOut, ShieldCheck, MapPin, Clock, Star, CreditCard } from 'lucide-react';

export default function CustomerProfile() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const fetchBookings = async (userId) => {
    try {
      const response = await fetch(`/api/bookings?user_id=${userId}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setTimeout(function() { setUser(parsedUser) }, 0);
      
      // Kiểm tra role - chỉ cho customer (role = 2)
      if (parsedUser.role !== 2) {
        router.push('/');
        return;
      }
      
      // Lấy lịch sử bookings
      setTimeout(function() { fetchBookings(parsedUser.id) }, 0);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.isConfirmed).length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
    upcomingBookings: bookings.filter(b => new Date(b.startDate) > new Date()).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-lg font-bold text-gray-800">Viet<span className="text-blue-600">Travel</span></span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/customer/profile" className="flex items-center gap-2 text-blue-600 font-semibold">
                <User size={16} />
                Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User size={48} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-blue-100 mb-4">Customer Account</p>
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{user.phone_number}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-300 mb-2">
                  <ShieldCheck size={20} />
                  <span className="font-semibold">Verified</span>
                </div>
                <p className="text-blue-100 text-sm">Member since {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                Tổng quan
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                Lịch sử
              </div>
            </button>
            <Link href="/wishlist" className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
              <div className="flex items-center gap-2">
                <span className="text-pink-500">§</span>
                Yêu thích
              </div>
            </Link>
            <Link href="/" className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
              <div className="flex items-center gap-2">
                <span className="text-green-500">H</span>
                Trang chủ
              </div>
            </Link>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar size={24} className="text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">{stats.totalBookings}</span>
                </div>
                <h3 className="text-gray-500 text-sm">Tổng bookings</h3>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShieldCheck size={24} className="text-green-600" />
                  </div>
                  <span className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</span>
                </div>
                <h3 className="text-gray-500 text-sm">Đã xác nhận</h3>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <CreditCard size={24} className="text-yellow-600" />
                  </div>
                  <span className="text-3xl font-bold text-blue-600">${stats.totalSpent.toLocaleString()}</span>
                </div>
                <h3 className="text-gray-500 text-sm">Tổng chi tiêu</h3>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock size={24} className="text-purple-600" />
                  </div>
                  <span className="text-3xl font-bold text-purple-600">{stats.upcomingBookings}</span>
                </div>
                <h3 className="text-gray-500 text-sm">Sắp đi</h3>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Booking gần đây</h3>
                <button 
                  onClick={() => setActiveTab('bookings')}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Xem tất cả
                </button>
              </div>
              
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Chưa có booking nào</p>
                  <Link href="/search" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    Tìm tour ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2">{booking.tourTitle}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{booking.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{new Date(booking.startDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">${booking.amount.toLocaleString()}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.isConfirmed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.isConfirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Lịch sử đặt tour</h3>
            
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">Chưa có booking nào</p>
                <Link href="/search" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Tìm tour ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{booking.tourTitle}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{booking.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(booking.startDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">${booking.amount.toLocaleString()}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.isConfirmed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.isConfirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
