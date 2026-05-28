export interface CancellationData {
  customerName: string;
  bookingId: number;
  tourTitle: string;
  cancellationDate: string;
  refundAmount?: string;
  refundDate?: string;
  reason?: string;
}

export function generateCancellationEmail(data: CancellationData): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận hủy tour - VietTravel</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Đặt tour đã bị hủy</h1>
      <p>Xác nhận hủy đặt tour</p>
    </div>
    <div class="content">
      <p>Chào <strong>${data.customerName}</strong>,</p>
      <p>Đặt tour của bạn đã được hủy theo yêu cầu. Dưới đây là chi tiết:</p>
      
      <div class="info-box">
        <h3>📋 Thông tin hủy tour</h3>
        <p><strong>Mã đặt tour:</strong> #${data.bookingId}</p>
        <p><strong>Tour:</strong> ${data.tourTitle}</p>
        <p><strong>Ngày hủy:</strong> ${data.cancellationDate}</p>
        ${data.reason ? `<p><strong>Lý do:</strong> ${data.reason}</p>` : ''}
      </div>

      ${data.refundAmount ? `
      <div class="info-box">
        <h3>💰 Thông tin hoàn tiền</h3>
        <p><strong>Số tiền hoàn:</strong> ${data.refundAmount}</p>
        <p><strong>Ngày hoàn tiền dự kiến:</strong> ${data.refundDate}</p>
        <p>Số tiền sẽ được hoàn về tài khoản thanh toán gốc trong 5-7 ngày làm việc.</p>
      </div>
      ` : `
      <div class="info-box">
        <h3>⚠️ Lưu ý</h3>
        <p>Theo chính sách hủy tour, số tiền hoàn sẽ được tính dựa trên thời gian hủy và chính sách của tour.</p>
      </div>
      `}

      <p>Nếu bạn có bất kỳ câu hỏi nào về việc hủy và hoàn tiền, vui lòng liên hệ với chúng tôi qua:</p>
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
