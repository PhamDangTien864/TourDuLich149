import { prisma } from "@/lib/prisma";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Sparkles } from "lucide-react";
import { TourCardSkeleton } from "./components/Skeleton";

export default async function HomePage() {
  // Lấy danh sách Tour thực tế từ database Railway với caching
  let tours = [];
  let dbError = null;

  try {
    tours = await prisma.tours.findMany({
      where: { is_active: true, is_deleted: false },
      orderBy: { id: "desc" },
      take: 6,
      include: {
        tour_images: {
          take: 1,
          select: { image_url: true }
        }
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    dbError = error;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      <Header />
      
      {/* Hero Section - Luxury Style */}
      <section className="relative h-[70vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://bizweb.dktcdn.net/100/516/683/products/wot1712904922-1.jpg?v=1718431571087" 
          className="absolute inset-0 w-full h-full object-cover scale-105" 
          alt="Vietnam Travel Hero"
          fill
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/30 via-amber-900/20 to-white" />
        
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 mb-8 animate-bounce">
            <Sparkles className="text-yellow-400" size={16} />
            <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Trí tuệ nhân tạo dẫn lối</span>
          </div>
          <h1 className="text-6xl md:text-[10rem] font-black text-white tracking-tighter leading-none mb-6 drop-shadow-2xl">
            Viet<span className="text-blue-400">Travel</span>
          </h1>
          <p className="text-white/90 font-bold text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Trải nghiệm du lịch Luxury cùng hệ thống đặt chỗ thông minh số 1 Việt Nam.
          </p>
        </div>
      </section>

      {/* Danh sách Tour nổi bật */}
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
          <div className="space-y-2">
            <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs">Khám phá ngay</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">Hành trình nổi bật</h2>
          </div>
          <Link href="/search" className="group flex items-center gap-2 bg-slate-50 hover:bg-blue-600 px-8 py-4 rounded-2xl transition-all duration-500">
            <span className="text-slate-900 group-hover:text-white font-black text-sm uppercase tracking-widest">Xem tất cả tour</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
          {dbError ? (
            <div className="col-span-full text-center py-20 bg-red-50 rounded-[40px] border-2 border-red-200">
              <p className="text-red-600 font-black text-xl mb-4">⚠️ Không thể kết nối database</p>
              <p className="text-red-500 font-bold mb-4">Kiểm tra DATABASE_URL trong file .env</p>
              <p className="text-red-400 text-sm">Error: {dbError.message}</p>
            </div>
          ) : tours.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-[40px] border-2 border-slate-200">
              <p className="text-slate-400 font-black text-xl">Chưa có tour nào</p>
            </div>
          ) : (
            tours.map(tour => (
              <Link href={`/tour/${tour.id}`} key={tour.id} className="group block">
                <div className="relative h-[450px] rounded-[50px] overflow-hidden mb-8 shadow-2xl shadow-slate-200/50">
                  <Image 
                    src={tour.tour_images[0]?.image_url || "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    alt={tour.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Overlay gradient khi hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-8 left-8 bg-white/20 backdrop-blur-xl px-5 py-2 rounded-2xl text-[10px] text-white font-black uppercase tracking-widest border border-white/20">
                    Luxury Collection
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                     <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                        Khám phá chi tiết
                     </button>
                  </div>
                </div>

                <div className="space-y-3 px-2">
                  <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{tour.title}</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                      <MapPin size={16} className="text-blue-500" /> {tour.location_name}
                    </div>
                    <p className="text-blue-600 font-black text-2xl tracking-tighter">
                      {Number(tour.price).toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}