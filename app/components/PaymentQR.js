'use client';
export default function PaymentQR({ amount, tourId }) {
  // Ní thay số tài khoản ngân hàng của ní vào đây
  const bankId = "vcb"; // vcb = Vietcombank
  const accountNo = "0912345678"; 
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=VietTravel_Tour_${tourId}`;

  return (
    <div className="bg-white p-6 rounded-[32px] border-2 border-dashed border-blue-100 text-center">
      <p className="font-black mb-4">Quét mã để đặt chỗ ngay</p>
      <img src={qrUrl} alt="QR Thanh toan" className="mx-auto w-48 h-48 rounded-xl shadow-lg" />
      <p className="text-[10px] text-slate-400 mt-2 italic">*Hệ thống sẽ tự động xác nhận sau khi ní chuyển khoản</p>
    </div>
  );
}