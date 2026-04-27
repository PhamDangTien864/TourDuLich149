'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Mobile sidebar overlay (Lớp phủ khi mở menu trên điện thoại) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Component */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* 3. Main Content Area */}
      <div className={`flex-1 transition-all duration-300 min-w-0 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Nút mở menu cho Mobile (Chỉ hiện khi sidebar đang đóng) */}
        {!sidebarOpen && (
          <div className="lg:hidden fixed top-4 left-4 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-slate-800 text-white p-3 rounded-xl shadow-xl hover:bg-slate-700 transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {/* Nội dung trang Dashboard/Tours/Users... */}
        <main className="p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}