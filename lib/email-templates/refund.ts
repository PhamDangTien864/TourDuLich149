export interface RefundData {
  customerName: string;
  bookingId: number;
  tourTitle: string;
  refundAmount: string;
  refundDate: string;
  refundMethod: string;
}

export function generateRefundEmail(data: RefundData): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hoàn tiền - VietTravel</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💸 Hoàn tiền thành công</h1>
      <p>Số tiền đã được hoàn về tài khoản của bạn</p>
    </div>
    <div class="content">
      <p>Chào <strong>${data.customerName}</strong>,</p>
      <p>Chúng tôi đã hoàn thành việc hoàn tiền cho đặt tour của bạn. Dưới đây là chi tiết:</p>
      
      <div class="info-box">
        <h3>📋 Thông tin hoàn tiền</h3>
        <p><strong>Mã đặt tour:</strong> #${data.bookingId}</p>
        <p><strong>Tour:</strong> ${data.tourTitle}</p>
        <p><strong>Số tiền hoàn:</strong> ${data.refundAmount}</p>
        <p><strong>Ngày hoàn tiền:</strong> ${data.refundDate}</p>
        <p><strong>Phương thức hoàn:</strong> ${data.refundMethod}</p>
      </div>

      <p>Số tiền đã được hoàn về tài khoản thanh toán gốc của bạn. Vui lòng kiểm tra tài khoản trong 1-3 ngày làm việc.</p>

      <p>Nếu bạn không nhận được số tiền hoàn sau 3 ngày làm việc, vui lòng liên hệ với chúng tôi qua:</p>
      <p>📞 Hotline: 1900 xxxx</p>
      <p>📧 Email: support@viettravel.com</p>

      <p>Rất tiếc vì không thể phục vụ bạn trong lần này. Mong sớm được đón tiếp bạn trong các tour khác!</p>
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
