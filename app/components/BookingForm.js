'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Phone, User, CreditCard, Mail } from "lucide-react";
import PaymentQR from "./PaymentQR";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingForm({ price, tourId }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCustomerDetails = async (userId) => {
    try {
      const res = await fetch(`/api/customers/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPhone(data.phone_number || '');
        setEmail(data.email || '');
        setBirthDate(data.birth_date ? data.birth_date.split('T')[0] : '');
      }
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
    }
  };

  // Lấy thông tin khách hàng đã đăng nhập
  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCustomerName(user.name || '');
        // Lấy thông tin chi tiết hơn từ API nếu cần
        fetchCustomerDetails(user.id);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Lỗi khi đọc dữ liệu user:", e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting booking:', { tourId, amount: Number(price), customerName, phone, email });
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId, amount: Number(price), customerName, phone, email })
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (data.success) {
        toast.success('Đặt tour thành công! Đang chuyển đến trang thanh toán.');
        console.log('Redirecting to payment:', `/payment?bookingId=${data.booking.id}&amount=${price}&tourId=${tourId}`);
        router.push(`/payment?bookingId=${data.booking.id}&amount=${price}&tourId=${tourId}`);
      } else {
        console.error('Booking failed:', data.error);
        toast.error(data.error || 'Đặt tour thất bại!');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Lỗi hệ thống, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handlePaidConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      if (res.ok) {
        toast.success("Hệ thống đang kiểm tra thanh toán của bạn!", { icon: '💰' });
        // Có thể chuyển hướng về trang lịch sử sau 2s
      }
    } catch (error) {
      toast.error("Lỗi gửi xác nhận!");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!showPayment ? (
          <motion.div 
            key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                {isLoggedIn ? 'Xác nhận thông tin' : 'Thông tin liên lạc'}
              </label>
              
              {isLoggedIn && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-4">
                  <p className="text-blue-300 text-sm font-medium flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-400" />
                    Đã đăng nhập với tài khoản: {email}
                  </p>
                </div>
              )}
              
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Họ và tên của bạn" 
                  className={`w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 outline-none focus:border-blue-500 transition font-bold text-white ${
                    isLoggedIn ? 'bg-blue-500/5 border-blue-500/30' : ''
                  }`}
                />
              </div>
              
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại" 
                  className={`w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 outline-none focus:border-blue-500 transition font-bold text-white ${
                    isLoggedIn ? 'bg-blue-500/5 border-blue-500/30' : ''
                  }`}
                />
              </div>
              
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (nhận thông báo)" 
                  className={`w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 outline-none focus:border-blue-500 transition font-bold text-white ${
                    isLoggedIn ? 'bg-blue-500/5 border-blue-500/30' : ''
                  }`}
                />
              </div>
              
              {birthDate && (
                <div className="relative">
                  <input 
                    type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 outline-none focus:border-blue-500 transition font-bold text-white bg-blue-500/5 border-blue-500/30"
                  />
                </div>
              )}
              
              {isLoggedIn && (
                <p className="text-blue-300 text-xs font-medium ml-2 mt-2">
                  ℹ️ Bạn có thể chỉnh sửa thông tin nếu cần thay đổi
                </p>
              )}
            </div>

            <button 
              onClick={handleSubmit} disabled={loading}
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
            <PaymentQR amount={price} tourId={tourId} />
            
            <button 
              onClick={handlePaidConfirm}
              disabled={confirming}
              className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2"
            >
              {confirming ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> TÔI ĐÃ CHUYỂN KHOẢN</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}