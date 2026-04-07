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
      [booking.tourName, `${booking.price.toLocaleString()} VND`, booking.date]
    ],
  });

  doc.save(`HoaDon_VietTravel_${booking.id}.pdf`);
};