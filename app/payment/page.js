"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PaymentQR from "../components/PaymentQR";
import { CheckCircle, Loader2, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [confirming, setConfirming] = useState(false);
  
  const bookingId = searchParams.get("bookingId");
  const amount = searchParams.get("amount");
  const tourId = searchParams.get("tourId");

  const handlePaidConfirm = async () => {
    if (!bookingId) {
      toast.error("Không tìm thấy thông tin booking");
      return;
    }

    setConfirming(true);
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: parseInt(bookingId) })
      });
      if (res.ok) {
        toast.success("Hệ thống đang kiểm tra thanh toán của bạn!", { icon: '💰' });
        setTimeout(() => {
          router.push("/history");
        }, 2000);
      } else {
        toast.error("Lỗi gửi xác nhận!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    } finally {
      setConfirming(false);
    }
  };

  if (!bookingId || !amount || !tourId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl font-bold">Không tìm thấy thông tin thanh toán</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30 text-green-400 flex items-center justify-center gap-2 mx-auto w-fit px-6 mb-8">
          <CheckCircle size={20} /> <span className="font-black text-sm">ĐẶT TOUR THÀNH CÔNG</span>
        </div>
        
        <PaymentQR amount={parseInt(amount)} tourId={parseInt(tourId)} />
        
        <button 
          onClick={handlePaidConfirm}
          disabled={confirming}
          className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 mt-6"
        >
          {confirming ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> TÔI ĐÃ CHUYỂN KHOẢN</>}
        </button>
        
        <p className="mt-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest leading-loose">
          Hệ thống sẽ tự động xác nhận sau khi bạn chuyển khoản
        </p>
      </div>
      <Footer />
    </div>
  );
}

export default function Payment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={32} />
          <p>Đang tải...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}