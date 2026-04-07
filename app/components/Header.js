import Link from 'next/link';
import { Plane, User } from 'lucide-react'; // Sử dụng Lucide React [cite: 1]

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          <Plane /> <span>VietTravel</span>
        </Link>
        <nav className="hidden md:flex gap-8 font-medium">
          <Link href="/" className="hover:text-blue-200 transition">Trang chủ</Link>
          <Link href="/search" className="hover:text-blue-200 transition">Tìm tour</Link>
          <Link href="/history" className="hover:text-blue-200 transition">Lịch sử</Link>
        </nav>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="hover:underline">Đăng nhập</Link>
          <Link href="/register" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition">
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}