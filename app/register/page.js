'use client';
import { User, Phone, Mail, Lock, Calendar } from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl shadow-blue-100 p-12 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter">Tạo tài khoản</h1>
            <p className="text-slate-500 font-bold">Tham gia cộng đồng du lịch VietTravel</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 ml-2 uppercase tracking-widest">Họ và tên</label>
              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl outline-none font-bold" /></div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 ml-2 uppercase tracking-widest">Số điện thoại</label>
              <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl outline-none font-bold" /></div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-400 ml-2 uppercase tracking-widest">Username</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl outline-none font-bold" /></div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-400 ml-2 uppercase tracking-widest">Mật khẩu</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl outline-none font-bold" /></div>
            </div>
          </div>
          
          <button className="w-full bg-slate-900 text-white py-5 rounded-[22px] font-black text-lg shadow-xl mt-8 hover:bg-blue-600 transition-all">Đăng ký tài khoản</button>
          <p className="text-center mt-8 text-slate-500 font-bold text-sm">Đã có tài khoản? <Link href="/login" className="text-blue-600 hover:underline">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
}