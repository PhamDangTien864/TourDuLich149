'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, Phone, User } from "lucide-react";
import PaymentQR from "./PaymentQR";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingForm({ tourId, price }) {
  const [loading, setLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const handleBooking = async () => {
    if (!customerName || !phone) {
      toast.error("Điền đầy đủ thông tin để VietTravel hỗ trợ ní nhé!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId, amount: price, customerName, phone }),
      });

      if (res.ok) {
        setIsBooked(true);
        toast.success("Tuyệt vời! Đơn hàng đã được ghi nhận.", { duration: 5000 });
      }
    } catch (error) {
      toast.error("Hệ thống bận rồi ní ơi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!isBooked ? (
          <motion.div 
            key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Thông tin liên lạc</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Họ và tên của ní" 
                  className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 outline-none focus:border-blue-500 transition font-bold text-white" 
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại" 
                  className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 outline-none focus:border-blue-500 transition font-bold text-white" 
                />
              </div>
            </div>

            <button 
              onClick={handleBooking} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-[24px] font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl shadow-blue-900/50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "XÁC NHẬN ĐẶT TOUR"}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="qr" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 text-center"
          >
            <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30 text-green-400 flex items-center justify-center gap-2 mx-auto w-fit px-6">
              <CheckCircle size={20} /> <span className="font-black text-sm">ĐẶT TOUR THÀNH CÔNG</span>
            </div>
            <PaymentQR amount={Number(price)} tourId={tourId} customerName={customerName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}