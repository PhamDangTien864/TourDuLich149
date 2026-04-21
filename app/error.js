'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log lỗi ra hệ thống monitoring nếu có (VD: Sentry)
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tighter">Ôi không! Đã có lỗi xảy ra.</h2>
      <p className="text-slate-500 font-bold mb-8 max-w-md">Hệ thống vừa gặp một sự cố nhỏ hoặc mất kết nối mạng. Vui lòng thử lại nhé!</p>
      <button onClick={() => reset()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95">
        Thử Lại Ngay
      </button>
    </div>
  );
}