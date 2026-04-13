"use client";

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Suspense } from "react";
// Dùng @ cho Next.js 16
import "@/app/globals.css"; 
import Chatbot from "@/app/components/Chatbot"; 

export default function AdminLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">VietTravel Admin</h1>
            <span className="text-slate-500 text-sm">Hệ thống quản lý</span>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden bg-slate-100 hover:bg-slate-200 p-2 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 6h16M4 18h16M4 24h16" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {/* Noi dung trang Admin */}
          {children}

          {/* CRITICAL FIX: Boc Chatbot trong Suspense de tranh loi 
             "Router action dispatched before initialization" 
          */}
          <Suspense fallback={null}>
            <Chatbot />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
