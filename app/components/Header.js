'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, LogOut, ShieldCheck } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Lỗi parse user_data:", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Lỗi parse user_data:", e);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null); // Cap nhat state ngay lap tuc
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
            <span className="text-white font-black">V</span>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tighter">Viet<span className="text-blue-600">Travel</span></span>
        </Link>

        {/* Menu chính */}
        <nav className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest">Trang chủ</Link>
          <Link href="/search" className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest">Tìm tour</Link>
          <Link href="/history" className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest">Lịch sử</Link>
          
          {/* Nút Hồ sơ biến hóa theo Role */}
          {user && (
            <Link 
              href={user.role === 1 ? "/admin" : "/customer/profile"} 
              className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-lg"
            >
              {user.role === 1 ? <ShieldCheck size={14}/> : <User size={14}/>}
              Hồ sơ {user.role === 1 ? 'Admin' : 'Customer'}
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/search" className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-slate-100">
            <Search size={16} />
            <span className="text-[10px] font-black uppercase">Tìm kiếm</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l pl-4 border-slate-100">
              <span className="text-[10px] font-black text-slate-400 hidden lg:block">Hi, {user.name}</span>
              <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-200">ĐĂNG NHẬP</Link>
          )}
        </div>
      </div>
    </header>
  );
}