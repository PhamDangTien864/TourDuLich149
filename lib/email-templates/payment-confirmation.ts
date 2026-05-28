export interface PaymentConfirmationData {
  customerName: string;
  bookingId: number;
  tourTitle: string;
  paymentAmount: string;
  paymentMethod: string;
  paymentDate: string;
  remainingAmount?: string;
}

export function generatePaymentConfirmationEmail(data: PaymentConfirmationData): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận thanh toán - VietTravel</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Thanh toán thành công!</h1>
      <p>Chúng tôi đã nhận được thanh toán của bạn</p>
    </div>
    <div class="content">
      <p>Chào <strong>${data.customerName}</strong>,</p>
      <p>Thanh toán của bạn đã được xác nhận thành công. Dưới đây là chi tiết giao dịch:</p>
      
      <div class="info-box">
        <h3>📋 Thông tin thanh toán</h3>
        <p><strong>Mã đặt tour:</strong> #${data.bookingId}</p>
        <p><strong>Tour:</strong> ${data.tourTitle}</p>
        <p><strong>Số tiền thanh toán:</strong> ${data.paymentAmount}</p>
        <p><strong>Phương thức:</strong> ${data.paymentMethod}</p>
        <p><strong>Ngày thanh toán:</strong> ${data.paymentDate}</p>
        ${data.remainingAmount ? `<p><strong>Số tiền còn lại:</strong> ${data.remainingAmount}</p>` : ''}
      </div>

      ${data.remainingAmount ? `
      <p>Vui lòng thanh toán số tiền còn lại trước ngày khởi hành để hoàn tất đặt tour.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${data.bookingId}" class="button">Thanh toán số tiền còn lại</a>
      ` : `
      <p>🎉 Đặt tour của bạn đã hoàn tất! Chúng tôi sẽ liên hệ với bạn trước ngày khởi hành để xác nhận chi tiết.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${data.bookingId}" class="button">Xem chi tiết đặt tour</a>
      `}

      <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua:</p>
      <p>📞 Hotline: 1900 xxxx</p>
      <p>📧 Email: support@viettravel.com</p>
    </div>
    <div class="footer">
      <p>© 2024 VietTravel. Tất cả quyền được bảo lưu.</p>
      <p>Đây là email tự động, vui lòng không trả lời.</p>
    </div>
  </div>
</body>
</html>
  `;
}
