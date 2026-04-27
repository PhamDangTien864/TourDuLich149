import { Be_Vietnam_Pro } from "next/font/google";
import FloatingContact from './components/FloatingContact';
import { Toaster } from 'react-hot-toast';
import "./globals.css"; // Đảm bảo bạn có import css để nhận biến font

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '700', '900'],
  subsets: ["vietnamese"],
  variable: "--font-be-vietnam",
});

export const metadata = {
  title: "VietTravel Luxury - Du lịch cao cấp",
  description: "Hệ thống đặt tour du lịch cao cấp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="antialiased">
        {children}
        <FloatingContact />
        <Toaster />
      </body>
    </html>
  );
}