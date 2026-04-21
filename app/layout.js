import { Be_Vietnam_Pro } from "next/font/google";
// Dùng relative path để Next.js tìm đúng file
import AdminLayoutClient from './components/AdminLayoutClient'; 
import FloatingContact from './components/FloatingContact'; 
import "./globals.css"; // Đảm bảo bạn có import css để nhận biến font

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '700', '900'],
  subsets: ["vietnamese"],
  variable: "--font-be-vietnam",
});

export const metadata = {
  title: "Quản trị VietTravel Luxury",
  description: "Hệ thống quản lý tour du lịch",
};

export default function AdminLayout({ children }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="antialiased">
        <AdminLayoutClient>{children}</AdminLayoutClient>
        <FloatingContact />
      </body>
    </html>
  );
}