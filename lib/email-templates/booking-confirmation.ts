export interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  bookingId: number;
  tourTitle: string;
  tourDate: string;
  totalAmount: string;
  passengers: number;
  status: string;
}

export function generateBookingConfirmationEmail(data: BookingConfirmationData): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đặt tour - VietTravel</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Xác nhận đặt tour thành công!</h1>
      <p>Cảm ơn bạn đã đặt tour qua VietTravel</p>
    </div>
    <div class="content">
      <p>Chào <strong>${data.customerName}</strong>,</p>
      <p>Đặt tour của bạn đã được xác nhận thành công. Dưới đây là chi tiết đặt tour của bạn:</p>
      
      <div class="info-box">
        <h3>📋 Thông tin đặt tour</h3>
        <p><strong>Mã đặt tour:</strong> #${data.bookingId}</p>
        <p><strong>Tour:</strong> ${data.tourTitle}</p>
        <p><strong>Ngày khởi hành:</strong> ${data.tourDate}</p>
        <p><strong>Số hành khách:</strong> ${data.passengers} người</p>
        <p><strong>Tổng tiền:</strong> ${data.totalAmount}</p>
        <p><strong>Trạng thái:</strong> ${data.status}</p>
      </div>

      <p>Vui lòng thanh toán để hoàn tất đặt tour của bạn. Bạn có thể thanh toán qua các phương thức sau:</p>
      <ul>
        <li>Chuyển khoản ngân hàng</li>
        <li>Thanh toán qua VNPay</li>
        <li>Thanh toán tại văn phòng</li>
      </ul>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${data.bookingId}" class="button">Xem chi tiết đặt tour</a>

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
