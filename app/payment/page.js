"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CheckCircle, Loader2, CreditCard, AlertCircle, Smartphone, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";

const BANKS = [
  { code: 'VNPAYQR', name: 'VNPay QR Code', icon: Smartphone },
  { code: 'VISA', name: 'Visa/MasterCard', icon: CreditCard },
  { code: 'NCB', name: 'Ngân hàng NCB', icon: Building2 },
  { code: 'SACOMBANK', name: 'Sacombank', icon: Building2 },
  { code: 'EXIMBANK', name: 'Eximbank', icon: Building2 },
  { code: 'MSBANK', name: 'MSBank', icon: Building2 },
  { code: 'VNMART', name: 'Ví điện tử VnMart', icon: Smartphone },
  { code: 'VIETINBANK', name: 'VietinBank', icon: Building2 },
  { code: 'VIETCOMBANK', name: 'Vietcombank', icon: Building2 },
  { code: 'HDBANK', name: 'HDBank', icon: Building2 },
  { code: 'DONGABANK', name: 'DongA Bank', icon: Building2 },
  { code: 'TPBANK', name: 'TPBank', icon: Building2 },
  { code: 'OCEANBANK', name: 'OceanBank', icon: Building2 },
  { code: 'BIDV', name: 'BIDV', icon: Building2 },
  { code: 'AGRIBANK', name: 'Agribank', icon: Building2 },
  { code: 'MBBANK', name: 'MB Bank', icon: Building2 },
  { code: 'ACB', name: 'ACB', icon: Building2 },
  { code: 'VPBANK', name: 'VPBank', icon: Building2 },
  { code: 'TECHCOMBANK', name: 'Techcombank', icon: Building2 },
  { code: 'SHBANK', name: 'Shinhan Bank', icon: Building2 },
  { code: 'STBANK', name: 'Sacombank', icon: Building2 },
  { code: 'VIB', name: 'VIB', icon: Building2 },
  { code: 'CIMB', name: 'CIMB', icon: Building2 },
  { code: 'KBANK', name: 'KBank', icon: Building2 },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  
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
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          amount: parseInt(amount),
          bankCode,
        }),
      });

      const data = await res.json();

      if (data.success && data.paymentUrl) {
        // Redirect to VNPay
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.error || 'Lỗi tạo thanh toán');
      }
    } catch {
      toast.error('Lỗi hệ thống');
    } finally {
      setLoading(false);
      setSelectedBank(null);
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
              <li>Sau khi thanh toán thành công, hệ thống sẽ tự động xác nhận booking</li>
              <li>Bạn có thể xem trạng thái booking trong trang &quot;Đặt tour của tôi&quot;</li>
              <li>Nếu gặp vấn đề, vui lòng liên hệ hỗ trợ</li>
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