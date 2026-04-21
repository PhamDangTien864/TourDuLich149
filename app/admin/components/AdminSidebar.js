"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard'
    },
    {
      id: 'tours',
      label: 'Quản lý Tours',
      icon: MapPin,
      href: '/admin/tours'
    },
    {
      id: 'users',
      label: 'Quản lý Users',
      icon: Users,
      href: '/admin/users'
    },
    {
      id: 'bookings',
      label: 'Quản lý Bookings',
      icon: Calendar,
      href: '/admin/bookings'
    },
    {
      id: 'analytics',
      label: 'Thống kê',
      icon: BarChart3,
      href: '/admin/analytics'
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      href: '/admin/settings'
    }
  ];

  // Auto-detect active item based on pathname
  useEffect(() => {
    const currentItem = menuItems.find(item => pathname === item.href);
    if (currentItem) {
      setTimeout(function() { setActiveItem(currentItem.id) }, 0);
    }
  }, [pathname, menuItems]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 bg-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <span className="text-white font-bold text-lg">VietTravel Admin</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:bg-slate-700 p-2 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeItem === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Bottom Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
            <Link
              href="/"
              className="flex items-center gap-3 text-slate-300 hover:text-white px-4 py-3 rounded-xl transition-all duration-200"
            >
              <Home size={20} />
              <span className="font-medium">Về trang chủ</span>
            </Link>
            
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
              }}
              className="flex items-center gap-3 text-slate-300 hover:text-white px-4 py-3 rounded-xl transition-all duration-200 w-full"
            >
              <LogOut size={20} />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => onClose()}
        className="lg:hidden fixed top-4 left-4 z-50 text-white bg-slate-800 p-2 rounded-lg"
      >
        <Menu size={20} />
      </button>
    </>
  );
}