'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookingForm from "../components/BookingForm"; // Dùng lại form mình đã viết

// 1. Phần ruột của trang (Chứa logic lấy tham số từ URL)
function BookingContent() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get('id');
  const price = searchParams.get('price');
  const title = searchParams.get('title');

  return (
    <main className="container mx-auto px-4 py-20 md:py-32 flex justify-center">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[48px] p-10 md:p-16 text-white shadow-2xl">
        <div className="mb-10 text-center">
          <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs mb-3">Thanh toán an toàn</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
            {title || "Hoàn tất đặt tour"}
          </h1>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>

        {/* Form xử lý đặt tour & Hiện QR */}
        <BookingForm tourId={tourId} price={price} />
        
        <p className="mt-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest leading-loose">
          Bằng việc nhấn xác nhận, ní đồng ý với <br/> 
          <span className="text-slate-400 underline cursor-pointer">điều khoản dịch vụ</span> của VietTravel.
        </p>
      </div>
    </main>
  );
}

// 2. Phần Export chính (Bọc Suspense để không bị lỗi Build)
export default function BookingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      {/* Suspense giúp Next.js biết là phần này cần đợi dữ liệu từ trình duyệt, 
        đừng có cố build tĩnh nó lúc này!
      */}
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      }>
        <BookingContent />
      </Suspense>

      <Footer />
    </div>
  );
}