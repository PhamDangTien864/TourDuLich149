import { prisma } from "@/lib/prisma";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { motion } from "framer-motion"; // Lưu ý: Nếu trang chủ là Server Component thì dùng CSS thường hoặc bọc Component con

export default async function HomePage() {
  const tours = await prisma.tours.findMany({
    where: { is_active: true, is_deleted: false },
    orderBy: { id: "desc" },
  });

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1552590635-27c2c2128b15?w=2000" className="absolute inset-0 w-full h-full object-cover scale-105" alt="Hero" />
        <div className="absolute inset-0 bg-slate-900/20" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-9xl font-black text-white tracking-tighter mb-6">Viet<span className="text-blue-400">Travel</span></h1>
          <p className="text-white/80 font-bold text-lg md:text-2xl max-w-2xl mx-auto">Trải nghiệm du lịch Luxury cùng trí tuệ nhân tạo số 1 Việt Nam.</p>
        </div>
      </section>

      {/* Danh sách Tour - Đã FIX Responsive */}
      <main className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Hành trình nổi bật</h2>
          <span className="text-blue-600 font-black text-sm uppercase tracking-widest cursor-pointer hover:underline">Xem tất cả</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14">
          {tours.map(tour => (
            <a href={`/tour/${tour.id}`} key={tour.id} className="group block">
              <div className="relative h-[400px] rounded-[40px] overflow-hidden mb-6 shadow-lg shadow-slate-100">
                <img src={tour.sub_title || "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={tour.title} />
                <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] text-white font-black uppercase tracking-widest border border-white/20">Hot Tour</div>
              </div>
              <h3 className="text-2xl font-black mb-2 text-slate-800 group-hover:text-blue-600 transition-colors">{tour.title}</h3>
              <p className="text-blue-600 font-black text-xl">{Number(tour.price).toLocaleString()}đ</p>
              <p className="text-slate-400 font-bold text-sm mt-1">{tour.location_name}</p>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}