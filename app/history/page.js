import { prisma } from "@/lib/prisma";
import { Ticket, Calendar, CheckCircle, Clock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function HistoryPage() {
  // Giả sử lấy bookings của customer_id = 1 (Ní sẽ fix theo session sau nhé)
  const bookings = await prisma.bookings.findMany({
    where: { customer_id: 1 },
    include: { tour: true },
    orderBy: { start_date: "desc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100"><Ticket size={32} /></div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Hành trình của ní</h1>
        </div>

        <div className="space-y-6">
          {bookings.length > 0 ? bookings.map(booking => (
            <div key={booking.id} className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:shadow-md transition-all">
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 font-black"><Ticket size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">{booking.tour.title}</h3>
                  <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {booking.start_date.toLocaleDateString('vi-VN')}</span>
                    {booking.is_confirmed ? (
                      <span className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-0.5 rounded-lg"><CheckCircle size={14} /> Đã xác nhận</span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg"><Clock size={14} /> Đang chờ</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right mt-6 md:mt-0">
                <p className="text-2xl font-black text-slate-800">{Number(booking.total_amount).toLocaleString()}đ</p>
                <button className="text-blue-600 font-black text-sm hover:underline mt-1">Xem hóa đơn</button>
              </div>
            </div>
          )) : (
            <p className="text-center text-slate-400 font-bold py-20">Ní chưa đặt tour nào hết trơn!</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}