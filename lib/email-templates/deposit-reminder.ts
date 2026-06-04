export interface DepositReminderData {
  customerName: string;
  customerEmail: string;
  bookingId: number;
  tourTitle: string;
  tourDate: string;
  depositAmount: string;
  dueDate: string;
}

export function generateDepositReminderEmail(data: DepositReminderData): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nhắc nhở thanh toán cọc - VietTravel</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Nhắc nhở thanh toán cọc</h1>
      <p>Đừng bỏ lỡ tour của bạn!</p>
    </div>
    <div class="content">
      <p>Chào <strong>${data.customerName}</strong>,</p>
      <p>Chúng tôi muốn nhắc nhở bạn về việc thanh toán cọc cho tour của mình:</p>
      
      <div class="info-box">
        <h3>📋 Thông tin đặt tour</h3>
        <p><strong>Mã đặt tour:</strong> #${data.bookingId}</p>
        <p><strong>Tour:</strong> ${data.tourTitle}</p>
        <p><strong>Ngày khởi hành:</strong> ${data.tourDate}</p>
        <p><strong>Số tiền cọc cần thanh toán:</strong> ${data.depositAmount}</p>
        <p><strong>Hạn thanh toán:</strong> ${data.dueDate}</p>
      </div>

      <p>Vui lòng thanh toán cọc trước hạn để giữ chỗ cho tour của bạn. Nếu không thanh toán đúng hạn, đặt tour của bạn có thể bị hủy.</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${data.bookingId}" class="button">Thanh toán ngay</a>

      <p>Nếu bạn đã thanh toán, vui lòng bỏ qua email này.</p>
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
