export interface ReviewRequestData {
  customerName: string;
  customerEmail: string;
  bookingId: number;
  tourTitle: string;
  tourDate: string;
}

export function generateReviewRequestEmail(data: ReviewRequestData): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đánh giá tour của bạn - VietTravel</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899; }
    .button { display: inline-block; background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ Chuyến đi của bạn thế nào?</h1>
      <p>Chia sẻ trải nghiệm của bạn với cộng đồng</p>
    </div>
    <div class="content">
      <p>Chào <strong>${data.customerName}</strong>,</p>
      <p>Chúng tôi hy vọng bạn đã có một chuyến đi tuyệt vời với tour <strong>${data.tourTitle}</strong> vào ngày ${data.tourDate}.</p>
      
      <p>Chia sẻ trải nghiệm của bạn giúp chúng tôi cải thiện dịch vụ và giúp khách hàng khác có lựa chọn tốt hơn.</p>

      <div class="info-box">
        <h3>📝 Đánh giá tour</h3>
        <p><strong>Mã đặt tour:</strong> #${data.bookingId}</p>
        <p><strong>Tour:</strong> ${data.tourTitle}</p>
      </div>

      <p>Vui lòng dành vài phút để đánh giá tour của bạn:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/tour/review/${data.bookingId}" class="button">Đánh giá ngay</a>

      <p>Những điều bạn có thể đánh giá:</p>
      <ul>
        <li>Chất lượng dịch vụ</li>
        <li>Hướng dẫn viên</li>
        <li>Lịch trình tour</li>
        <li>Giá trị tour</li>
        <li>Khách sạn và ăn uống</li>
      </ul>

      <p>Cảm ơn bạn đã chọn VietTravel. Mong sớm được phục vụ bạn trong các chuyến đi tiếp theo!</p>
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
