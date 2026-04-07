'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
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
    if (!username || !password) {
      toast.error("Ní quên nhập tài khoản hoặc mật khẩu kìa!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Chào mừng ${data.user.name} quay trở lại!`, { icon: '🚀' });
        if (data.user.role === 1) router.push('/admin');
        else router.push('/');
      } else {
        toast.error(data.error || "Sai tài khoản rồi ní!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối rồi ní ơi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white w-full max-w-md rounded-[48px] shadow-2xl shadow-blue-100 p-10 md:p-14 border border-slate-100"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter">Chào ní! 👋</h1>
            <p className="text-slate-400 font-bold">Hành trình mới đang đợi ní phía trước</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-[0.2em]">Username</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username của ní" 
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-[0.2em]">Mật khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" 
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[28px] font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Tiếp tục <ArrowRight size={22} /></>}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-bold text-sm">
              Chưa có tài khoản? <Link href="/register" className="text-blue-600 hover:underline underline-offset-4">Đăng ký ngay</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}