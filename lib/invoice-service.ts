import { prisma } from './prisma';
import { ErrorHandler } from './errors';

export interface InvoiceData {
  bookingId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tourTitle: string;
  location: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  paidAmount: number;
  adultsCount: number;
  childrenCount: number;
  passengers?: any[];
}

export class InvoiceService {
  static async generateInvoice(bookingId: number): Promise<{ success: boolean; invoice?: any; error?: string }> {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          customers: true,
          tours: {
            select: {
              title: true,
              location_name: true
            }
          },
          booking_passengers: true,
          booking_payments: {
            orderBy: { created_at: 'desc' }
          }
        }
      });

      if (!booking) {
        return { success: false, error: 'Booking không tồn tại' };
      }

      const invoiceData: InvoiceData = {
        bookingId: booking.id,
        customerName: booking.customers?.full_name ?? "Khách hàng",
        customerPhone: booking.customers?.phone_number ?? "",
        customerEmail: booking.customers?.email ?? undefined,
        tourTitle: booking.tours?.title ?? "",
        location: booking.tours?.location_name ?? "",
        startDate: booking.start_date,
        endDate: booking.end_date,
        totalAmount: Number(booking.total_amount),
        paidAmount: Number(booking.paid_amount || 0),
        adultsCount: booking.adults_count ?? 0,
        childrenCount: booking.children_count ?? 0,
        passengers: booking.booking_passengers
      };

      const invoice = this.formatInvoice(invoiceData);

      return { success: true, invoice };
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Generate invoice error');
      return { success: false, error: 'Lỗi khi tạo hóa đơn' };
    }
  }

  static formatInvoice(data: InvoiceData): any {
    const invoiceNumber = `INV-${data.bookingId}-${Date.now()}`;
    const invoiceDate = new Date();
    const dueDate = new Date(data.startDate);
    dueDate.setDate(dueDate.getDate() - 7); // Due 7 days before departure

    const items = [
      {
        description: `Tour du lịch: ${data.tourTitle}`,
        location: data.location,
        startDate: data.startDate.toLocaleDateString('vi-VN'),
        endDate: data.endDate.toLocaleDateString('vi-VN'),
        quantity: data.adultsCount + data.childrenCount,
        unitPrice: data.totalAmount / (data.adultsCount + data.childrenCount),
        amount: data.totalAmount
      }
    ];

    const subtotal = data.totalAmount;
    const tax = 0; // No tax for domestic tourism
    const total = subtotal + tax;
    const remaining = total - data.paidAmount;

    return {
      invoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      customer: {
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail
      },
      items,
      summary: {
        subtotal,
        tax,
        total,
        paid: data.paidAmount,
        remaining
      },
      passengers: data.passengers?.map(p => ({
        name: p.full_name,
        birthDate: p.birth_date,
        gender: p.gender,
        phone: p.phone_number,
        isChild: p.is_child
      }))
    };
  }

  static async createInvoiceRecord(bookingId: number): Promise<{ success: boolean; invoiceId?: number; error?: string }> {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          customers: true,
          tours: true
        }
      });

      if (!booking) {
        return { success: false, error: 'Booking không tồn tại' };
      }

      // Check if invoice already exists
      const existingInvoice = await prisma.transactions.findFirst({
        where: {
          booking_id: bookingId,
          transaction_type: 'invoice'
        }
      });

      if (existingInvoice) {
        return { success: true, invoiceId: existingInvoice.id };
      }

      // Create invoice record
      const invoice = await prisma.transactions.create({
        data: {
          booking_id: bookingId,
          account_id: booking.account_id,
          amount: booking.total_amount,
          transaction_type: 'invoice'
        }
      });

      return { success: true, invoiceId: invoice.id };
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Create invoice record error');
      return { success: false, error: 'Lỗi khi tạo bản ghi hóa đơn' };
    }
  }

  static async getInvoicePDF(bookingId: number): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
    try {
      // In production, this would generate a PDF using a library like jsPDF or puppeteer
      // For now, return a placeholder
      const invoice = await this.generateInvoice(bookingId);
      
      if (!invoice.success) {
        return invoice;
      }

      // Placeholder URL - in production, generate actual PDF
      const pdfUrl = `/api/invoices/${bookingId}/pdf`;
      
      return { success: true, pdfUrl };
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Get invoice PDF error');
      return { success: false, error: 'Lỗi khi lấy PDF hóa đơn' };
    }
  }

  static async sendInvoiceEmail(bookingId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const invoice = await this.generateInvoice(bookingId);
      
      if (!invoice.success) {
        return invoice;
      }

      // Import email service
      const { sendEmail } = await import('./email-service');
      
      // Generate HTML invoice email
      const html = this.generateInvoiceEmailHTML(invoice.invoice);
      
      await sendEmail({
        to: invoice.invoice.customer.email || 'noreply@viettravel.com',
        subject: `Hóa đơn đặt tour #${bookingId} - VietTravel`,
        html
      });

      return { success: true };
    } catch (error) {
      ErrorHandler.log(ErrorHandler.handle(error), 'Send invoice email error');
      return { success: false, error: 'Lỗi khi gửi email hóa đơn' };
    }
  }

  static generateInvoiceEmailHTML(invoice: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .invoice-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .total { background: #667eea; color: white; padding: 15px; border-radius: 5px; text-align: right; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HÓA ĐƠN ĐẶT TOUR</h1>
            <p>Mã hóa đơn: ${invoice.invoiceNumber}</p>
          </div>
          <div class="content">
            <div class="invoice-details">
              <h3>Thông tin khách hàng</h3>
              <p><strong>Tên:</strong> ${invoice.customer.name}</p>
              <p><strong>Số điện thoại:</strong> ${invoice.customer.phone}</p>
              ${invoice.customer.email ? `<p><strong>Email:</strong> ${invoice.customer.email}</p>` : ''}
            </div>
            
            <div class="invoice-details">
              <h3>Chi tiết tour</h3>
              ${invoice.items.map((item: any) => `
                <p><strong>Tour:</strong> ${item.description}</p>
                <p><strong>Địa điểm:</strong> ${item.location}</p>
                <p><strong>Ngày khởi hành:</strong> ${item.startDate}</p>
                <p><strong>Ngày kết thúc:</strong> ${item.endDate}</p>
                <p><strong>Số hành khách:</strong> ${item.quantity}</p>
              `).join('')}
            </div>

            <div class="total">
              <p>Tổng cộng: ${invoice.summary.total.toLocaleString()}đ</p>
              <p>Đã thanh toán: ${invoice.summary.paid.toLocaleString()}đ</p>
              <p>Còn lại: ${invoice.summary.remaining.toLocaleString()}đ</p>
            </div>

            <div class="footer">
              <p>Cảm ơn bạn đã đặt tour với VietTravel!</p>
              <p>Liên hệ: 1900 xxxx | support@viettravel.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
