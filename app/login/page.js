'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error("Nhập tài khoản và mật khẩu!");
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('auth_token', data.clientToken);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        toast.success(`Chào mừng ${data.user.name} đã trở lại!`);
        
        if (data.user.role === 1) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        // Bắt lỗi chi tiết cho login
        if (res.status === 403) {
          toast.error("Tài khoản chưa được xác thực! Vui lòng check email.");
        } else if (res.status === 401) {
          toast.error("Sai tên đăng nhập hoặc mật khẩu!");
        } else if (res.status === 404) {
          toast.error("Tài khoản không tồn tại!");
        } else if (data.details) {
          // ZodError - hiển thị từng trường lỗi
          if (Array.isArray(data.details)) {
            data.details.forEach(error => {
              toast.error(`${error.path?.[0] || 'Lỗi'}: ${error.message}`);
            });
          } else {
            toast.error(data.details);
          }
        } else {
          toast.error(data.error || "Đăng nhập thất bại!");
        }
      }
    } catch (error) {
      console.error("FRONTEND_LOGIN_ERROR:", error);
      toast.error("Không thể kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white w-full max-w-md rounded-[48px] shadow-2xl shadow-blue-100 p-10 md:p-14 border border-slate-100"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter">Chào bạn!</h1>
            <p className="text-slate-400 font-bold">Hành trình Luxury dành cho bạn</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Username</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username" 
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Mật khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder=".........." 
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" 
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[28px] font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Tiếp tục <ArrowRight size={22} /></>}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-bold text-sm">
              Bạn chưa có tài khoản? <Link href="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}