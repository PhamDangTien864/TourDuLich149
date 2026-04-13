'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, Lock, Calendar, Loader2, ArrowRight, CheckCircle, AtSign } from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    username: '',
    email: '', // THÊM TRƯỜNG NÀY
    password: '',
    birth_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsSuccess(true);
        toast.success("Đăng ký thành công! Check email.");
      } else {
        toast.error(data.error || "Dữ liệu chưa đúng định dạng!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl shadow-blue-100 p-10 md:p-16 border border-slate-100"
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div key="form" exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter">Gia nhập VietTravel ✈️</h1>
                  <p className="text-slate-400 font-bold">Tạo tài khoản riêng, email nhận mã riêng cho chất</p>
                </div>

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Họ và tên */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Họ và tên</label>
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} placeholder="Họ tên của ní" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" />
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Số điện thoại</label>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input type="tel" required value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} placeholder="09xxx" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" />
                    </div>
                  </div>

                  {/* Username - Dùng AtSign cho lạ */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Username</label>
                    <div className="relative group">
                      <AtSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="tên_đăng_nhập" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" />
                    </div>
                  </div>

                  {/* Email - Ô NHẬP RIÊNG BIỆT */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Địa chỉ Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="ví dụ: ni@gmail.com" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" />
                    </div>
                  </div>

                  {/* Ngày sinh */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Ngày sinh</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input type="date" required value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" />
                    </div>
                  </div>

                  {/* Mật khẩu */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Mật khẩu</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800" />
                    </div>
                  </div>

                  <button disabled={loading} className="md:col-span-2 w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[28px] font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : <>Đăng ký ngay <ArrowRight size={22} /></>}
                  </button>
                </form>

                <p className="mt-8 text-center text-slate-500 font-bold text-sm">
                  Đã có tài khoản? <Link href="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4">Gửi mail thành công!</h2>
                <p className="text-slate-500 font-bold mb-10 leading-relaxed">Hãy check hòm thư <span className="text-blue-600 underline">{formData.email}</span> <br/> (kể cả Spam) để kích hoạt tài khoản!</p>
                <Link href="/login" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:shadow-blue-200 transition-all">VỀ ĐĂNG NHẬP</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}