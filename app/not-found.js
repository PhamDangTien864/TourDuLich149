import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-[12rem] md:text-[16rem] font-black text-slate-100 leading-none tracking-tighter">
            404
          </h1>
          <div className="relative -mt-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-900 blur-3xl opacity-20" />
            <h2 className="relative text-4xl md:text-6xl font-black text-slate-900 mb-4">
              Trang không tìm thấy
            </h2>
          </div>
        </div>
        
        <p className="text-xl text-slate-600 mb-12 font-medium">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        
        <Link 
          href="/"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-slate-900 text-white px-8 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <Home size={20} />
          Quay lại trang chủ
          <ArrowRight size={20} />
        </Link>
        
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          <Link href="/search" className="text-slate-400 hover:text-blue-600 transition-colors">
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-sm font-bold">Tìm tour</div>
          </Link>
          <Link href="/about" className="text-slate-400 hover:text-blue-600 transition-colors">
            <div className="text-3xl mb-2">ℹ️</div>
            <div className="text-sm font-bold">Về chúng tôi</div>
          </Link>
          <Link href="/contact" className="text-slate-400 hover:text-blue-600 transition-colors">
            <div className="text-3xl mb-2">📞</div>
            <div className="text-sm font-bold">Liên hệ</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
