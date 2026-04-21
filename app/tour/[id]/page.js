import { prisma } from "@/lib/prisma";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingForm from "../../components/BookingForm";
import { MapPin, Info, CheckCircle2, Globe, Star, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import Image from 'next/image';

// SEO Mượt mà: Tự động đổi tiêu đề trang theo tên Tour
export async function generateMetadata({ params }) {
  // BẮT BUỘC: Phải await params trước khi dùng id
  const { id } = await params; 
  
  // Validate id
  if (!id || isNaN(Number(id))) {
    return {
      title: "Tour không tìm thấy | VietTravel Luxury",
      description: "Tour không tồn tại hoặc ID không hợp lệ",
    };
  }
  
  const tour = await prisma.tours.findUnique({ 
    where: { id: Number(id) } 
  });

  return {
    title: `${tour?.title || "Tour du lịch"} | VietTravel Luxury`,
    description: tour?.description?.substring(0, 160) || "Khám phá Việt Nam cùng trợ lý AI",
  };
}

export default async function TourDetailPage({ params }) {
  // BẮT BUỘC: Giải nén params bằng await để tránh lỗi P1001/Validation
  const { id } = await params; 

  // Validate id
  if (!id || isNaN(Number(id))) {
    return notFound();
  }

  const tour = await prisma.tours.findUnique({
    where: { id: Number(id) },
    include: { category: true } // Lấy thông tin loại tour từ bảng tour_categories
  });

  if (!tour) return notFound();

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Cột trái: Thông tin chi tiết */}
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none text-slate-900">
                {tour.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold">
                <span className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs uppercase tracking-widest">
                  {tour.category?.category_name || "Tour Đặc Sắc"}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <MapPin size={18} /> {tour.location_name}
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <Star size={18} fill="currentColor" /> 4.9 (Đánh giá cao)
                </span>
              </div>
            </div>

            {/* Ảnh Tour - Sử dụng sub_title để chứa link ảnh */}
            <div className="rounded-[48px] overflow-hidden h-[400px] md:h-[650px] shadow-2xl">
              <Image 
                src={tour.sub_title || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" 
                alt={tour.title}
                fill
                sizes="(max-width: 1200px)"
              />
            </div>

            {/* Mô tả chi tiết hành trình */}
            <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Info className="text-blue-600" /> Chi tiết hành trình
              </h3>
              <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                {tour.description || "Hành trình đẳng cấp đang chờ đón bạn khám phá..."}
              </div>
            </div>
          </div>

          {/* Cột phải: Form đặt chỗ */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl sticky top-28 border border-white/5">
              <div className="mb-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Giá khởi hành</p>
                <h2 className="text-5xl font-black text-blue-400">
                  {Number(tour.price).toLocaleString()}đ
                </h2>
              </div>

              {/* Form đặt tour - Truyền dữ liệu sang component con */}
              <BookingForm tourId={tour.id} price={tour.price} />

              {/* Cam kết dịch vụ */}
              <div className="mt-8 space-y-4 pt-8 border-t border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-blue-500" /> Bảo hiểm du lịch 1 tỷ đồng
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-blue-500" /> Hoàn hủy miễn phí 24h
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}