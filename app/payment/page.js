"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CheckCircle, Loader2, CreditCard, AlertCircle, Smartphone, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";
import QRCode from "qrcode";

const BANKS = [
  { code: 'VNPAYQR', name: 'VNPay QR Code', icon: Smartphone },
  { code: 'MOMOQR', name: 'Momo QR Code', icon: Smartphone },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  
  const bookingId = searchParams.get("bookingId");
  const amount = searchParams.get("amount");
  const tourId = searchParams.get("tourId");
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  useEffect(() => {
    // Check authentication via API instead of localStorage
    fetch('/api/user/profile')
      .then(res => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.user && data.user.role_id === 1) {
          router.push('/admin');
        }
      })
      .catch(err => {
        console.error('Auth check error:', err);
      });
  }, [router]);

  // Load booking details if only bookingId is provided (resume payment flow)
  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!bookingId || amount || tourId) return;
      
      setIsLoadingBooking(true);
      console.log('Loading booking details for ID:', bookingId);
      
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        console.log('Booking API response status:', res.status);
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Failed to load booking (status: ${res.status})`);
        }
        
        const data = await res.json();
        console.log('Booking API response data:', data);
        
        if (data.success && data.booking) {
          setBookingDetails(data.booking);
          // Redirect with full parameters
          const params = new URLSearchParams({
            bookingId: bookingId,
            amount: data.booking.total_amount,
            tourId: data.booking.tour_id
          });
          console.log('Redirecting to payment with params:', params.toString());
          router.replace(`/payment?${params.toString()}`);
        } else {
          throw new Error(data.error || 'Invalid booking data');
        }
      } catch (err) {
        console.error('Load booking error:', err);
        toast.error(err.message || 'Không tìm thấy booking');
        // Redirect to bookings page instead of showing error
        router.push('/my-bookings');
      } finally {
        setIsLoadingBooking(false);
      }
    };

    loadBookingDetails();
  }, [bookingId, amount, tourId, router]);

  // Handle callback status
  useEffect(() => {
    if (status === 'success') {
      toast.success('Thanh toán thành công!', { icon: '✅' });
      setTimeout(() => {
        router.push('/customer/bookings');
      }, 2000);
    } else if (status === 'failed') {
      toast.error(message || 'Thanh toán thất bại', { icon: '❌' });
    } else if (status === 'invalid') {
      toast.error('Giao dịch không hợp lệ', { icon: '⚠️' });
    } else if (status === 'error') {
      toast.error('Lỗi hệ thống', { icon: '❌' });
    }
  }, [status, message, router]);

  const handlePayment = async (bankCode) => {
    if (!bookingId || !amount) {
      toast.error("Không tìm thấy thông tin booking");
      return;
    }

    setLoading(true);
    setSelectedBank(bankCode);

    try {
      // Generate QR code locally using qrcode library
      const bankId = process.env.NEXT_PUBLIC_BANK_ID || 'MB';
      const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0862640720';
      const accountName = process.env.NEXT_PUBLIC_ACCOUNT_NAME || 'VIET TRAVEL';
      
      // Create QR code data for Vietnam bank transfer
      // Format: Bank ID + Account Number + Amount + Account Name
      const qrData = `${bankId}|${bankAccount}|${amount}|${accountName}`;
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCode(qrCodeDataURL);
      setShowQR(true);
      toast.success('Đã tạo mã QR thanh toán');
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Lỗi tạo mã QR');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    console.log('Confirm payment clicked, bookingId:', bookingId, 'type:', typeof bookingId);
    
    if (!bookingId) {
      toast.error("Không tìm thấy thông tin booking");
      return;
    }

    const parsedBookingId = parseInt(bookingId, 10);
    console.log('Parsed bookingId:', parsedBookingId, 'isNaN:', isNaN(parsedBookingId));
    
    if (isNaN(parsedBookingId)) {
      toast.error("Booking ID không hợp lệ");
      return;
    }

    setConfirmingPayment(true);

    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: parsedBookingId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Thanh toán thành công!', { icon: '✅' });
        setTimeout(() => {
          router.push('/my-bookings');
        }, 2000);
      } else {
        toast.error(data.error || 'Lỗi xác nhận thanh toán');
      }
    } catch {
      toast.error('Lỗi hệ thống');
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (isLoadingBooking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-xl font-bold">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!bookingId || !amount || !tourId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl font-bold">Không tìm thấy thông tin thanh toán</p>
          <button 
            onClick={() => router.push('/customer/bookings')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold"
          >
            Xem đặt tour của tôi
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <p className="text-2xl font-bold mb-2">Thanh toán thành công!</p>
          <p className="text-slate-400 mb-6">Đang chuyển đến trang booking...</p>
          <Loader2 className="animate-spin mx-auto" size={32} />
        </div>
      </div>
    );
  }

  if (showQR) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30 text-green-400 flex items-center justify-center gap-2 mx-auto w-fit px-6 mb-8">
            <CheckCircle size={20} /> <span className="font-black text-sm">ĐẶT TOUR THÀNH CÔNG</span>
          </div>
          
          <div className="bg-white rounded-3xl p-8 mb-6">
            <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Quét mã QR để thanh toán</h2>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-slate-600 font-bold">
                Số tiền cần thanh toán: <span className="text-blue-600 text-xl">{parseInt(amount).toLocaleString('vi-VN')} VNĐ</span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 mb-6">
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                {/* Real QR Code */}
                <div className="w-64 h-64 flex items-center justify-center">
                  {qrCode ? (
                    <img 
                      src={qrCode} 
                      alt="QR Code thanh toán" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Smartphone size={48} className="text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">Đang tạo mã QR...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-slate-600 mb-2">Ngân hàng: <span className="font-bold">{process.env.NEXT_PUBLIC_BANK_ID || 'MB Bank'}</span></p>
                <p className="text-slate-600 mb-2">Số tài khoản: <span className="font-bold">{process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0862640720'}</span></p>
                <p className="text-slate-600">Chủ tài khoản: <span className="font-bold">{process.env.NEXT_PUBLIC_ACCOUNT_NAME || 'VIET TRAVEL'}</span></p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-xl font-bold transition-all"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={confirmingPayment}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {confirmingPayment ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Xác nhận đã thanh toán
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-bold mb-1">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Quét mã QR bằng ứng dụng ngân hàng để thanh toán</li>
                <li>Sau khi thanh toán, nhấn &quot;Xác nhận đã thanh toán&quot;</li>
                <li>Hệ thống sẽ cập nhật trạng thái booking sau khi xác nhận</li>
              </ul>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30 text-green-400 flex items-center justify-center gap-2 mx-auto w-fit px-6 mb-8">
          <CheckCircle size={20} /> <span className="font-black text-sm">ĐẶT TOUR THÀNH CÔNG</span>
        </div>
        
        <div className="bg-white rounded-3xl p-8 mb-6">
          <h2 className="text-2xl font-black text-slate-800 mb-6">Chọn phương thức thanh toán</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-slate-600 font-bold">
              Số tiền cần thanh toán: <span className="text-blue-600 text-xl">{parseInt(amount).toLocaleString('vi-VN')} VNĐ</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BANKS.map((bank) => {
              const Icon = bank.icon;
              return (
                <button
                  key={bank.code}
                  onClick={() => handlePayment(bank.code)}
                  disabled={loading}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedBank === bank.code
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  {loading && selectedBank === bank.code ? (
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                  ) : (
                    <Icon size={24} className="text-slate-600" />
                  )}
                  <span className="text-xs font-bold text-slate-700 text-center">{bank.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-bold mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chọn phương thức thanh toán để hiển thị mã QR</li>
              <li>Quét mã QR bằng ứng dụng ngân hàng để thanh toán</li>
              <li>Sau khi thanh toán, xác nhận để hoàn tất đặt tour</li>
            </ul>
          </div>
        </div>
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