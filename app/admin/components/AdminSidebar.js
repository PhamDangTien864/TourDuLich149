"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, MapPin, Settings, 
  LogOut, X, Home, BarChart3, Calendar,
  ChevronLeft, ChevronRight, CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ isOpen, onClose, isCollapsed, setSidebarCollapsed }) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'tours', label: 'Quản lý Tours', icon: MapPin, href: '/admin/tours' },
    { id: 'users', label: 'Quản lý Users', icon: Users, href: '/admin/users' },
    { id: 'bookings', label: 'Quản lý Bookings', icon: Calendar, href: '/admin/bookings' },
    { id: 'transactions', label: 'Giao dịch', icon: CreditCard, href: '/admin/transactions' },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3, href: '/admin/analytics' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, href: '/admin/settings' }
  ];

  useEffect(() => {
    const currentItem = menuItems.find(item => pathname === item.href);
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [pathname]);

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 bg-slate-900 transform transition-all duration-300 ease-in-out border-r border-slate-800
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
      ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      w-64 flex flex-col
    `}>
      {/* --- HEADER SIDEBAR --- */}
      <div className={`relative flex items-center h-20 bg-slate-900/50 px-4 border-b border-slate-800 transition-all duration-300`}>
        <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'mx-auto' : ''}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 transition-transform duration-300 hover:scale-110">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col transition-all duration-300 opacity-100">
              <span className="text-white font-black text-lg leading-tight tracking-tight">VietTravel</span>
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Management</span>
            </div>
          )}
        </div>

        {/* Nút Thu gọn/Mở rộng (Desktop) - Nằm ngay mép phải */}
        <button 
          onClick={() => setSidebarCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full items-center justify-center border-4 border-slate-50 hover:bg-blue-700 transition-all duration-300 shadow-md z-50 hover:scale-110 active:scale-95"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Nút đóng (Mobile) */}
        <button onClick={onClose} className="lg:hidden ml-auto text-slate-400 hover:text-white p-2 transition-colors duration-200 hover:rotate-90">
          <X size={24} />
        </button>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            title={isCollapsed ? item.label : ''}
            className={`
              flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3.5 rounded-2xl transition-all duration-300 group
              ${activeItem === item.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }
            `}
          >
            <item.icon size={22} className={`transition-all duration-300 ${activeItem === item.id ? '' : 'group-hover:scale-110 group-hover:-rotate-3'}`} />
            {!isCollapsed && <span className="font-bold text-sm tracking-wide transition-all duration-300">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* --- BOTTOM SECTION --- */}
      <div className={`p-3 space-y-2 border-t border-slate-800 bg-slate-900/80 transition-all duration-300`}>
        <Link
          href="/"
          title={isCollapsed ? 'Về trang chủ' : ''}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-slate-400 hover:text-white px-4 py-3 rounded-xl transition-all duration-300 hover:bg-slate-800`}
        >
          <Home size={20} className="transition-transform duration-300 hover:scale-110" />
          {!isCollapsed && <span className="font-bold text-sm transition-all duration-300">Về trang chủ</span>}
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
          }}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-red-400 hover:bg-red-500/10 hover:text-red-300 px-4 py-3 rounded-xl transition-all duration-300 w-full`}
        >
          <LogOut size={20} className="transition-transform duration-300 hover:scale-110" />
          {!isCollapsed && <span className="font-bold text-sm transition-all duration-300">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
}