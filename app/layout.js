import { Be_Vietnam_Pro } from "next/font/google";
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import "./globals.css"; // Đảm bảo bạn có import css để nhận biến font

// Lazy load FloatingContact to improve initial page load
const FloatingContact = dynamic(() => import('./components/FloatingContact'), {
  loading: () => null // Don't show loading state for floating widget
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '700', '900'],
  subsets: ["vietnamese"],
  variable: "--font-be-vietnam",
  display: 'swap', // Optimize font loading with font-display: swap
  preload: true, // Preload critical fonts
});

export const metadata = {
  title: {
    default: "VietTravel Luxury - Du lịch cao cấp",
    template: "%s | VietTravel Luxury"
  },
  description: "Hệ thống đặt tour du lịch cao cấp Việt Nam. Khám phá Đà Nẵng, Phú Quốc, Nha Trang, Hạ Long với giá tốt nhất.",
  keywords: "tour du lịch Việt Nam, đặt tour Đà Nẵng, tour Phú Quốc, tour Nha Trang, du lịch cao cấp, đặt tour online",
  authors: [{ name: "VietTravel Luxury" }],
  creator: "VietTravel Luxury",
  publisher: "VietTravel Luxury",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://viettravel.vn'),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'VietTravel Luxury',
    title: 'VietTravel Luxury - Du lịch cao cấp Việt Nam',
    description: 'Hệ thống đặt tour du lịch cao cấp Việt Nam',
    images: [
      {
        url: 'https://bizweb.dktcdn.net/100/516/683/products/wot1712904922-1.jpg?v=1718431571087',
        width: 1200,
        height: 630,
        alt: 'VietTravel Luxury - Du lịch cao cấp Việt Nam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VietTravel Luxury - Du lịch cao cấp Việt Nam',
    description: 'Hệ thống đặt tour du lịch cao cấp Việt Nam',
    images: ['https://bizweb.dktcdn.net/100/516/683/products/wot1712904922-1.jpg?v=1718431571087'],
  },
  robots: {
    index: true,
    follow: true,
  },
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