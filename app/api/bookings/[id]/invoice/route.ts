import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    // Find booking with all details
    const booking = await prisma.bookings.findFirst({
      where: { id: bookingId },
      include: {
        customers: true,
        tours: {
          include: {
            tour_categories: true
          }
        },
        accounts: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking or is admin
    if (booking.account_id !== user.id && user.role_id !== 1) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate HTML invoice
    const html = generateInvoiceHTML(booking);

    return NextResponse.json({ 
      success: true, 
      html,
      booking: {
        id: booking.id,
        customerName: booking.customers?.full_name || 'Khách hàng',
        tourTitle: booking.tours.title,
        amount: Number(booking.total_amount),
        startDate: booking.start_date,
        endDate: booking.end_date
      }
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateInvoiceHTML(booking: any) {
  const totalAmount = Number(booking.total_amount).toLocaleString('vi-VN');
  const startDate = new Date(booking.start_date).toLocaleDateString('vi-VN');
  const endDate = new Date(booking.end_date).toLocaleDateString('vi-VN');
  const createdDate = new Date(booking.created_at || new Date()).toLocaleDateString('vi-VN');
  const customerName = booking.customers?.full_name || 'Khách hàng';
  const customerPhone = booking.customers?.phone_number || 'N/A';
  const customerEmail = booking.customers?.email || 'N/A';
  const categoryName = booking.tours.tour_categories?.category_name || 'N/A';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hóa Đơn Đặt Tour - VietTravel</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 40px;
      background-color: #f5f5f5;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #1e3a8a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #1e3a8a;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      margin: 0;
      color: #1e3a8a;
    }
    .invoice-info p {
      margin: 5px 0;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h3 {
      color: #1e3a8a;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
    }
    .label {
      width: 150px;
      font-weight: bold;
      color: #333;
    }
    .value {
      color: #666;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .table th, .table td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    .table th {
      background-color: #1e3a8a;
      color: white;
    }
    .total {
      text-align: right;
      font-size: 24px;
      font-weight: bold;
      color: #1e3a8a;
      margin-top: 20px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
    }
    .status.pending { background-color: #fff3cd; color: #856404; }
    .status.confirmed { background-color: #d4edda; color: #155724; }
    .status.cancelled { background-color: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">🌴 VietTravel</div>
      <div class="invoice-info">
        <h2>HÓA ĐƠN ĐẶT TOUR</h2>
        <p>Mã: #${booking.id}</p>
        <p>Ngày: ${createdDate}</p>
      </div>
    </div>

    <div class="section">
      <h3>Thông Tin Khách Hàng</h3>
      <div class="info-row">
        <span class="label">Họ tên:</span>
        <span class="value">${customerName}</span>
      </div>
      <div class="info-row">
        <span class="label">Số điện thoại:</span>
        <span class="value">${customerPhone}</span>
      </div>
      <div class="info-row">
        <span class="label">Email:</span>
        <span class="value">${customerEmail}</span>
      </div>
    </div>

    <div class="section">
      <h3>Thông Tin Tour</h3>
      <div class="info-row">
        <span class="label">Tour:</span>
        <span class="value">${booking.tours.title}</span>
      </div>
      <div class="info-row">
        <span class="label">Địa điểm:</span>
        <span class="value">${booking.tours.location_name}</span>
      </div>
      <div class="info-row">
        <span class="label">Danh mục:</span>
        <span class="value">${categoryName}</span>
      </div>
      <div class="info-row">
        <span class="label">Ngày đi:</span>
        <span class="value">${startDate}</span>
      </div>
      <div class="info-row">
        <span class="label">Ngày về:</span>
        <span class="value">${endDate}</span>
      </div>
      <div class="info-row">
        <span class="label">Trạng thái:</span>
        <span class="value"><span class="status ${booking.status}">${booking.status}</span></span>
      </div>
    </div>

    <div class="section">
      <h3>Chi Tiết Thanh Toán</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Mô tả</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${booking.tours.title}</td>
            <td>1</td>
            <td>${totalAmount}đ</td>
            <td>${totalAmount}đ</td>
          </tr>
        </tbody>
      </table>
      <div class="total">Tổng cộng: ${totalAmount}đ</div>
    </div>

    <div class="footer">
      <p><strong>VietTravel - Hệ thống đặt tour hàng đầu Việt Nam</strong></p>
      <p>Hotline: 1900 1234 | Email: support@viettravel.com</p>
      <p>© 2024 VietTravel. Tất cả quyền được bảo lưu.</p>
    </div>
  </div>
</body>
</html>
  `;
}
