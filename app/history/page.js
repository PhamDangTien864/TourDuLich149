import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import Header from "../components/Header";
import { Ticket, Calendar, CheckCircle, Clock } from "lucide-react";

export default async function HistoryPage() {
  // Lấy User ID từ Token trong Cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return <div className="p-20 text-center font-black">Vui lòng đăng nhập để xem lịch sử!</div>;
  }

  const bookings = await prisma.bookings.findMany({
    where: { account_id: user.id }, // Lấy theo ID người đang đăng nhập
    include: { tour: true },
    orderBy: { start_date: "desc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-12">Hành trình của {user.name}</h1>
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white p-8 rounded-[35px] border border-slate-100 flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-black">{booking.tour.title}</h3>
                  <p className="text-sm text-slate-400 font-bold">{booking.start_date.toLocaleDateString('vi-VN')}</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-blue-600">{Number(booking.total_amount).toLocaleString()}đ</p>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${booking.is_confirmed ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {booking.is_confirmed ? 'Thành công' : 'Chờ xác nhận'}
                  </span>
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}