'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

export default function PaymentQR({ amount, tourId }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef(null);

  // Lấy thông tin thanh toán từ biến môi trường (Bảo mật hơn)
  const bankId = process.env.NEXT_PUBLIC_BANK_ID || "mbbank";
  const accountNo = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "0862640720";
  const accountName = process.env.NEXT_PUBLIC_ACCOUNT_NAME || "VIET TRAVEL";

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Tạo nội dung QR code theo chuẩn VietQR
        // Format: 000201|010212|... (VietQR format)
        // Hoặc đơn giản hóa: bank info + amount + description
        
        const qrContent = `${bankId}|${accountNo}|${amount}|VietTravel_Tour_${tourId}`;
        
        // Sử dụng qrcode package để tạo QR code
        const url = await QRCode.toDataURL(qrContent, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
        // Fallback to external service if local generation fails
        const fallbackUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=VietTravel_Tour_${tourId}`;
        setQrCodeUrl(fallbackUrl);
      }
    };

    generateQRCode();
  }, [amount, tourId, bankId, accountNo]);

  return (
    <div className="bg-white p-6 rounded-[32px] border-2 border-dashed border-blue-100 text-center">
      <p className="font-black mb-4">Quét mã để thanh toán</p>
      {qrCodeUrl ? (
        <img 
          src={qrCodeUrl} 
          alt="QR Thanh toán" 
          className="mx-auto w-48 h-48 rounded-xl shadow-lg" 
        />
      ) : (
        <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div className="mt-4 space-y-2">
        <p className="text-sm font-bold text-slate-700">
          Ngân hàng: <span className="text-blue-600">{bankId.toUpperCase()}</span>
        </p>
        <p className="text-sm font-bold text-slate-700">
          Số tài khoản: <span className="text-blue-600">{accountNo}</span>
        </p>
        <p className="text-sm font-bold text-slate-700">
          Chủ tài khoản: <span className="text-blue-600">{accountName}</span>
        </p>
        <p className="text-sm font-bold text-slate-700">
          Số tiền: <span className="text-blue-600">{Number(amount).toLocaleString()}đ</span>
        </p>
        <p className="text-sm font-bold text-slate-700">
          Nội dung: <span className="text-blue-600">VietTravel_Tour_{tourId}</span>
        </p>
      </div>
      <p className="text-[10px] text-slate-400 mt-4 italic">*Vui lòng chờ admin xác nhận thanh toán sau khi chuyển khoản</p>
    </div>
  );
}