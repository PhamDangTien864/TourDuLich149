'use client';

export default function PaymentQR({ amount, tourId }) {
  // Lấy thông tin thanh toán từ biến môi trường (Bảo mật hơn)
  const bankId = process.env.NEXT_PUBLIC_BANK_ID || "mbbank";
  const accountNo = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "0862640720";
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=VietTravel_Tour_${tourId}`;

  return (
    <div className="bg-white p-6 rounded-[32px] border-2 border-dashed border-blue-100 text-center">
      <p className="font-black mb-4">Quét mã để đặt chỗ ngay</p>
      <img src={qrUrl} alt="QR Thanh toán" className="mx-auto w-48 h-48 rounded-xl shadow-lg" />
      <p className="text-[10px] text-slate-400 mt-2 italic">*Vui lòng chờ admin xác nhận thanh toán sau khi chuyển khoản</p>
    </div>
  );
}