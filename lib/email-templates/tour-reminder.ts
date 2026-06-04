export interface TourReminderData {
  customerName: string;
  customerEmail: string;
  bookingId: number;
  tourTitle: string;
  departureDate: string;
  pickupLocation: string;
  pickupTime: string;
  contactPerson: string;
  contactPhone: string;
}

export function generateTourReminderEmail(data: TourReminderData): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nhắc nhở khởi hành - VietTravel</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ Tour của bạn sắp khởi hành!</h1>
      <p>Chuẩn bị cho chuyến đi thú vị</p>
    </div>
    <div class="content">
      <p>Chào <strong>${data.customerName}</strong>,</p>
      <p>Tour của bạn sẽ khởi hành trong vài ngày tới. Dưới đây là thông tin quan trọng:</p>
      
      <div class="info-box">
        <h3>📋 Thông tin khởi hành</h3>
        <p><strong>Mã đặt tour:</strong> #${data.bookingId}</p>
        <p><strong>Tour:</strong> ${data.tourTitle}</p>
        <p><strong>Ngày khởi hành:</strong> ${data.departureDate}</p>
        <p><strong>Điểm đón:</strong> ${data.pickupLocation}</p>
        <p><strong>Giờ đón:</strong> ${data.pickupTime}</p>
      </div>

      <div class="info-box">
        <h3>📞 Thông tin liên hệ</h3>
        <p><strong>Người phụ trách:</strong> ${data.contactPerson}</p>
        <p><strong>Số điện thoại:</strong> ${data.contactPhone}</p>
      </div>

      <p><strong>Lưu ý quan trọng:</strong></p>
      <ul>
        <li>Vui lòng có mặt tại điểm đón trước 15 phút</li>
        <li>Mang theo giấy tờ tùy thân (CMND/CCCD)</li>
        <li>Kiểm tra lại hành lý và vật dụng cá nhân</li>
        <li>Đảm bảo sức khỏe tốt trước chuyến đi</li>
      </ul>

      <p>Chúc bạn có một chuyến đi vui vẻ và an toàn!</p>
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
