import { Inter } from "next/font/google"; // Sửa từ font-awesome thành font/google
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VietTravel - Hành trình du lịch Luxury",
  description: "Khám phá Việt Nam cùng trợ lý AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}