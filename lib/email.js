import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmationEmail({ email, customerName, tourTitle, location, amount, startDate, endDate }) {
  if (!email) {
    console.log('No email provided, skipping email send');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'VietTravel <booking@viettravel.com>',
      to: [email],
      subject: 'Xác nhận đặt tour thành công - VietTravel',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác nhận đặt tour - VietTravel</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              color: #bfdbfe;
              margin: 10px 0 0 0;
              font-size: 16px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .greeting strong {
              color: #1e40af;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .booking-details {
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 25px;
              margin-bottom: 30px;
              border-left: 4px solid #3b82f6;
            }
            .booking-details h3 {
              color: #1e40af;
              margin: 0 0 20px 0;
              font-size: 20px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              color: #6b7280;
              font-weight: 500;
            }
            .detail-value {
              color: #1f2937;
              font-weight: 600;
            }
            .amount {
              color: #059669;
              font-size: 20px;
              font-weight: 700;
            }
            .footer {
              background-color: #1f2937;
              padding: 30px;
              text-align: center;
            }
            .footer p {
              color: #9ca3af;
              margin: 5px 0;
              font-size: 14px;
            }
            .footer a {
              color: #3b82f6;
              text-decoration: none;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: #ffffff;
              padding: 15px 30px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Đặt Tour Thành Công!</h1>
              <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của VietTravel</p>
            </div>
            
            <div class="content">
              <p class="greeting">
                Chào <strong>${customerName}</strong>,
              </p>
              
              <p class="message">
                Chúng tôi rất vui mừng được thông báo rằng đặt tour của bạn đã được xác nhận thành công. 
                Cảm ơn bạn đã lựa chọn VietTravel cho hành trình khám phá Việt Nam của mình.
              </p>
              
              <div class="booking-details">
                <h3>📋 Chi tiết đặt tour</h3>
                <div class="detail-row">
                  <span class="detail-label">Tour:</span>
                  <span class="detail-value">${tourTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Địa điểm:</span>
                  <span class="detail-value">${location}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Ngày bắt đầu:</span>
                  <span class="detail-value">${new Date(startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Ngày kết thúc:</span>
                  <span class="detail-value">${new Date(endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tổng tiền:</span>
                  <span class="detail-value amount">${Number(amount).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              
              <p class="message">
                Đội ngũ VietTravel cam kết mang đến cho bạn trải nghiệm du lịch đẳng cấp và đáng nhớ nhất. 
                Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.
              </p>
              
              <a href="https://viettravel.com" class="cta-button">Xem chi tiết tour</a>
            </div>
            
            <div class="footer">
              <p><strong>VietTravel - Hệ thống đặt tour hàng đầu Việt Nam</strong></p>
              <p>Hotline: 1900 1234 | Email: support@viettravel.com</p>
              <p>© 2024 VietTravel. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

export async function sendResetPasswordEmail({ email, name, resetLink }) {
  if (!email) {
    console.log('No email provided, skipping email send');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'VietTravel <noreply@viettravel.com>',
      to: [email],
      subject: 'Đặt lại mật khẩu - VietTravel',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt lại mật khẩu - VietTravel</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .warning-box {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin-bottom: 30px;
              border-radius: 8px;
            }
            .warning-box p {
              margin: 0;
              color: #92400e;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: #ffffff;
              padding: 15px 30px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              background-color: #1f2937;
              padding: 30px;
              text-align: center;
            }
            .footer p {
              color: #9ca3af;
              margin: 5px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Đặt Lại Mật Khẩu</h1>
            </div>
            
            <div class="content">
              <p class="greeting">
                Chào <strong>${name}</strong>,
              </p>
              
              <p class="message">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
              </p>
              
              <div class="warning-box">
                <p>⚠️ Link này chỉ có hiệu lực trong 1 giờ. Vui lòng đặt lại mật khẩu ngay bây giờ.</p>
              </div>
              
              <a href="${resetLink}" class="cta-button">Đặt Lại Mật Khẩu</a>
              
              <p class="message" style="margin-top: 30px;">
                Nếu bạn không thể nhấp vào nút trên, hãy sao chép và dán link sau vào trình duyệt:<br>
                <span style="color: #3b82f6; word-break: break-all;">${resetLink}</span>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>VietTravel - Hệ thống đặt tour hàng đầu Việt Nam</strong></p>
              <p>© 2024 VietTravel. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    console.log('Reset password email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}
