'use client';

import { useState, useEffect, memo, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { ErrorHandler } from "@/lib/errors";

const Header = memo(function Header() {
  const { user, loading: authLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/tour-categories', { 
          cache: 'force-cache',
          next: { revalidate: 3600 } // Cache for 1 hour
        });
        const data = await res.json();
        setCategories(data || []);
      } catch (error) {
        ErrorHandler.log(ErrorHandler.handle(error), 'Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchOpen && !e.target.closest('.search-dropdown-container')) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setSearchOpen(prev => !prev);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white via-blue-50/30 to-white backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all shadow-lg shadow-blue-500/30">
            <span className="text-white font-black text-lg">V</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-black text-slate-800 tracking-tighter">Viet<span className="text-blue-600">Travel</span></span>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Luxury Travel</div>
          </div>
        </Link>

        {/* Menu chính */}
        <nav className="hidden md:flex items-center gap-1 bg-white px-2 py-2 rounded-2xl shadow-lg border border-slate-200">
          <Link 
            href="/" 
            className={`text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${
              pathname === '/' 
                ? 'text-white bg-blue-600 shadow-md' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Trang chủ
            {pathname === '/' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
          </Link>
          <Link 
            href="/promotions" 
            className={`text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${
              pathname === '/promotions' 
                ? 'text-white bg-blue-600 shadow-md' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Khuyến mãi
            {pathname === '/promotions' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
          </Link>
          <Link 
            href="/reviews" 
            className={`text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${
              pathname === '/reviews' 
                ? 'text-white bg-blue-600 shadow-md' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Đánh giá
            {pathname === '/reviews' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
          </Link>
          <Link 
            href="/blog" 
            className={`text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${
              pathname === '/blog' 
                ? 'text-white bg-blue-600 shadow-md' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Tin tức
            {pathname === '/blog' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
          </Link>
          {/* Search Dropdown - Ẩn với admin */}
          {(!user || (user.role !== 1 && user.role_id !== 1)) && (
            <Link 
              href="/search" 
              className={`text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${
                pathname === '/search' 
                  ? 'text-white bg-blue-600 shadow-md' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Tìm tour
              {pathname === '/search' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
            </Link>
          )}
          {/* Link Lịch sử - Ẩn với admin */}
          {(!user || (user.role !== 1 && user.role_id !== 1)) && (
            <Link 
              href="/customer/bookings" 
              className={`text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${
                pathname === '/customer/bookings' 
                  ? 'text-white bg-blue-600 shadow-md' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Lịch sử
              {pathname === '/customer/bookings' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
            </Link>
          )}
          {/* Tab 'Tôi' cho khách hàng */}
          {user && user.role === 2 && (
            <Link 
              href="/customer/me" 
              className={`text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${
                pathname === '/customer/me' 
                  ? 'text-white bg-blue-600 shadow-md' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Tôi
              {pathname === '/customer/me' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>}
            </Link>
          )}
          
          {/* Nút Hồ sơ biến hóa theo Role */}
          {user && (
            <Link
              href={user.role_id === 1 || user.role === 1 ? "/admin" : "/customer/profile"}
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 relative group ${
                pathname.startsWith(user.role_id === 1 || user.role === 1 ? '/admin' : '/customer')
                  ? (user.role_id === 1 || user.role === 1 
                      ? 'text-white bg-red-600 shadow-md ring-2 ring-red-400 ring-offset-2' 
                      : 'text-white bg-blue-600 shadow-md')
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {user.role_id === 1 || user.role === 1 ? <ShieldCheck size={14}/> : <User size={14}/> }
              {user.role_id === 1 || user.role === 1 ? 'Admin' : 'Hồ sơ'}
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-all"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-4 border-l pl-4 border-slate-100">
              <span className="text-[10px] font-black text-slate-400 hidden lg:block">Hi, {user.name}</span>
              <button onClick={logout} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-200">ĐĂNG NHẬP</Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4">
          <nav className="flex flex-col gap-2">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
                pathname === '/' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Trang chủ
            </Link>
            <Link 
              href="/promotions" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
                pathname.startsWith('/promotions')
                  ? 'text-green-600 bg-green-50' 
                  : 'text-slate-500 hover:text-green-600 hover:bg-slate-50'
              }`}
            >
              Khuyến mãi
            </Link>
            <Link 
              href="/reviews" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
                pathname.startsWith('/reviews')
                  ? 'text-yellow-600 bg-yellow-50' 
                  : 'text-slate-500 hover:text-yellow-600 hover:bg-slate-50'
              }`}
            >
              Đánh giá
            </Link>
            <Link 
              href="/blog" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
                pathname.startsWith('/blog')
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-slate-500 hover:text-pink-600 hover:bg-slate-50'
              }`}
            >
              Tin tức
            </Link>
            {/* Search & Lịch sử - Ẩn với admin */}
            {(!user || (user.role !== 1 && user.role_id !== 1)) && (
              <>
                <Link 
                  href="/search" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
                    pathname === '/search' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Tìm tour
                </Link>
                <Link 
                  href="/customer/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
                    pathname === '/customer/bookings'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Lịch sử
                </Link>
              </>
            )}
            
            {user && user.role === 2 && (
              <Link 
                href="/customer/me" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
                  pathname === '/customer/me' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Tôi
              </Link>
            )}
            
            {user && (
              <Link
                href={user.role_id === 1 || user.role === 1 ? "/admin" : "/customer/profile"}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
                  pathname.startsWith(user.role_id === 1 || user.role === 1 ? '/admin' : '/customer')
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {user.role_id === 1 || user.role === 1 ? <ShieldCheck size={14}/> : <User size={14}/> }
                {user.role_id === 1 || user.role === 1 ? 'Admin' : 'Hồ sơ'}
              </Link>
            )}

            {user && (
              <button 
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
              >
                <LogOut size={14} />
                Đăng xuất
              </button>
            )}

            {!user && (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-200 text-center"
              >
                ĐĂNG NHẬP
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
});

export default Header;