'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, MapPin, Home, History, Heart, Edit, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProfileDashboardPage() {
  const [userId, setUserId] = useState(() => {
    // Lazy initialization - read from localStorage on mount
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role_id === 1) {
          window.location.href = '/admin';
          return null;
        }
        return user.id;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      window.location.href = '/login';
    }
  }, []);

  const { data, isLoading } = useSWR(
    userId ? `/api/customers/${userId}` : null,
    fetcher
  );

  const customer = data?.data || data?.customer || data || {};

  if (isLoading || !userId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            {/* Tiêu đề giả */}
            <div className="h-10 bg-slate-200 rounded w-1/3 mb-8"></div>
            {/* Menu giả */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded-xl w-32"></div>
              ))}
            </div>
            {/* Khung thông tin giả */}
            <div className="bg-white rounded-2xl p-8 shadow-lg h-96 border border-slate-100"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-800 mb-8">Hồ sơ cá nhân</h1>

          {/* Thanh Menu Điều Hướng (Dashboard) */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <Home size={18} /> Trang chủ
            </Link>
            <button className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <User size={18} /> Hồ sơ cá nhân
            </button>
            <Link href="/customer/bookings" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <History size={18} /> Lịch sử đặt tour
            </Link>
            <Link href="/customer/favorites" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <Heart size={18} /> Tour yêu thích
            </Link>
          </div>

          {/* Thẻ Hiển Thị Thông Tin (Read-only) */}
          <div className="bg-white rounded-2xl p-8 shadow-lg relative overflow-hidden border border-slate-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <User className="text-blue-600" size={24} /> Thông tin của bạn
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Họ và tên</p>
                <p className="text-lg font-bold text-slate-800">{customer.name || customer.full_name || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                <p className="text-lg font-bold text-slate-800">{customer.phone_number || customer.phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-lg font-bold text-slate-800">{customer.email || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ngày sinh</p>
                <p className="text-lg font-bold text-slate-800">
                  {customer.birth_date ? new Date(customer.birth_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Địa chỉ</p>
                <p className="text-lg font-bold text-slate-800">{customer.address || 'Chưa cập nhật'}</p>
              </div>
            </div>

            {/* NÚT CHUYỂN SANG TRANG CẬP NHẬT (/customer/me) */}
            <div className="border-t border-slate-100 pt-6 flex justify-end">
              <Link href="/customer/me" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black transition-all shadow-lg shadow-blue-500/30">
                <Edit size={20} /> Cập nhật thông tin cá nhân
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}