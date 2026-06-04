import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (booking) => {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.text("HOA DON DAT TOUR - VIETTRAVEL", 20, 20);
  
  // Vẽ bảng thông tin tour
  doc.autoTable({
    startY: 30,
    head: [['Dịch vụ', 'Giá tour', 'Ngày đi']],
    body: [
      [booking.tours?.title || 'N/A', `${Number(booking.total_amount).toLocaleString()} VND`, new Date(booking.start_date).toLocaleDateString('vi-VN')]
    ],
  });

  doc.save(`HoaDon_VietTravel_${booking.id}.pdf`);
};