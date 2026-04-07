import { prisma } from "@/lib/prisma";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingForm from "../../components/BookingForm";
import { MapPin, Info, CheckCircle2, Globe, Star, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

// SEO Mượt mà: Tự động đổi tiêu đề trang theo tên Tour
export async function generateMetadata({ params }) {
  const tour = await prisma.tours.findUnique({ where: { id: parseInt(params.id) } });
  return {
    title: `${tour?.title || "Tour du lịch"} | VietTravel Luxury`,
    description: tour?.description?.substring(0, 160) || "Khám phá Việt Nam cùng trợ lý AI",
  };
}

export default async function TourDetailPage({ params }) {
  const { id } = params;
  const tour = await prisma.tours.findUnique({
    where: { id: parseInt(id) },
    include: { category: true }
  });

  if (!tour) return notFound();

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">{tour.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold">
                <span className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs uppercase tracking-widest">{tour.category?.category_name}</span>
                <span className="flex items-center gap-2 text-sm"><MapPin size={18} /> {tour.location_name}</span>
                <span className="flex items-center gap-1 text-orange-400"><Star size={18} fill="currentColor" /> 4.9</span>
              </div>
            </div>

            <div className="rounded-[48px] overflow-hidden h-[400px] md:h-[650px] shadow-2xl">
              <img src={tour.sub_title || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"} className="w-full h-full object-cover" alt={tour.title} />
            </div>

            <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Info className="text-blue-600" /> Chi tiết hành trình</h3>
              <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">{tour.description || "Hành trình đang được cập nhật..."}</div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl sticky top-28 border border-white/5">
              <div className="mb-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Giá khởi hành</p>
                <h2 className="text-5xl font-black text-blue-400">{Number(tour.price).toLocaleString()}đ</h2>
              </div>
              <BookingForm tourId={tour.id} price={tour.price} />
              <div className="mt-8 space-y-4 pt-8 border-t border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-blue-500" /> Bảo hiểm du lịch 1 tỷ đồng</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-blue-500" /> Hoàn hủy miễn phí 24h</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}