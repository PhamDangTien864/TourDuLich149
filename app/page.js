import { prisma } from "@/lib/prisma";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Sparkles, Search, Calendar, Users, Star, Shield, Clock, Award, CheckCircle, TrendingUp, Flame, Crown, ArrowRight } from "lucide-react";
import { generateOrganizationSchema, generateLocalBusinessSchema } from "@/lib/seo/structured-data";
import { ErrorHandler } from "@/lib/errors";

export const metadata = {
  title: "VietTravel Luxury - Đặt Tour Du Lịch Cao Cấp Việt Nam | Đà Nẵng, Phú Quốc, Nha Trang",
  description: "Đặt tour du lịch cao cấp Việt Nam với VietTravel Luxury. Khám phá Đà Nẵng, Phú Quốc, Nha Trang, Hạ Long với giá tốt nhất. Hệ thống đặt tour thông minh số 1 Việt Nam.",
  keywords: "tour du lịch Việt Nam, đặt tour Đà Nẵng, tour Phú Quốc, tour Nha Trang, du lịch cao cấp, đặt tour online, tour Hạ Long, tour Sapa, tour miền Bắc, tour miền Nam",
  authors: [{ name: "VietTravel Luxury" }],
  creator: "VietTravel Luxury",
  publisher: "VietTravel Luxury",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://viettravel.vn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'VietTravel Luxury',
    title: 'VietTravel Luxury - Đặt Tour Du Lịch Cao Cấp Việt Nam',
    description: 'Đặt tour du lịch cao cấp Việt Nam với VietTravel Luxury. Khám phá Đà Nẵng, Phú Quốc, Nha Trang, Hạ Long với giá tốt nhất.',
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
    title: 'VietTravel Luxury - Đặt Tour Du Lịch Cao Cấp Việt Nam',
    description: 'Đặt tour du lịch cao cấp Việt Nam với VietTravel Luxury. Khám phá Đà Nẵng, Phú Quốc, Nha Trang, Hạ Long với giá tốt nhất.',
    images: ['https://bizweb.dktcdn.net/100/516/683/products/wot1712904922-1.jpg?v=1718431571087'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// Lazy load heavy components
const SearchForm = dynamic(() => import("./components/SearchForm"), {
  loading: () => <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
});
const TourCard = dynamic(() => import("./components/TourCard"), {
  loading: () => <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
});

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
    ErrorHandler.log(ErrorHandler.handle(error), 'Database connection error');
    dbError = error;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema())
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessSchema())
        }}
      />
      
      <Header />
      
      {/* Hero Section - Luxury Style with Search Form */}
      <section className="relative h-[70vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://bizweb.dktcdn.net/100/516/683/products/wot1712904922-1.jpg?v=1718431571087"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          alt="Vietnam Travel Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/30 via-amber-900/20 to-white" />
        
        <div className="relative z-10 text-center px-4 w-full max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 mb-8 animate-bounce">
            <Sparkles className="text-yellow-400" size={16} />
            <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Trí tuệ nhân tạo dẫn lối</span>
          </div>
          <h1 className="text-6xl md:text-[10rem] font-black text-white tracking-tighter leading-none mb-6 drop-shadow-2xl">
            Viet<span className="text-blue-400">Travel</span>
          </h1>
          <p className="text-white/90 font-bold text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed drop-shadow-lg mb-12">
            Trải nghiệm du lịch Luxury cùng hệ thống đặt chỗ thông minh số 1 Việt Nam.
          </p>

          {/* Search Form */}
          <SearchForm />
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
                  <img
                    src={tour.tour_images[0]?.image_url || "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt={tour.title}
                  />

                  {/* Badge */}
                  <div className="absolute top-8 left-8 bg-blue-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Luxury
                  </div>

                  {/* Price badge */}
                  <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-blue-600 font-black text-sm shadow-lg">
                    {Number(tour.price).toLocaleString()}đ
                  </div>

                  {/* Overlay gradient khi hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-8 left-8 right-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                     <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 hover:text-white transition-colors">
                       Xem chi tiết
                     </button>
                  </div>
                </div>

                <div className="space-y-3 px-2">
                  <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">{tour.title}</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                      <MapPin size={16} className="text-blue-500" /> {tour.location_name}
                    </div>
                    <div className="flex items-center gap-1 text-orange-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold">4.9</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      {/* Trending Destinations Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Điểm đến hot</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">Xu hướng du lịch 2024</h2>
            <p className="text-slate-600 font-bold text-lg max-w-2xl mx-auto">Khám phá những điểm đến được yêu thích nhất hiện nay</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Đà Nẵng", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400", tours: 45 },
              { name: "Nha Trang", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400", tours: 38 },
              { name: "Phú Quốc", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400", tours: 32 },
              { name: "Sapa", image: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=400", tours: 28 }
            ].map((dest, idx) => (
              <Link href={`/search?q=${dest.name}`} key={idx} className="group relative h-[300px] rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <img
                  src={dest.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={dest.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white font-black text-2xl mb-2">{dest.name}</h3>
                  <p className="text-white/80 font-bold text-sm">{dest.tours} tour có sẵn</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="bg-gradient-to-r from-red-500 to-orange-500 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl">
                <Flame className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-white font-black text-3xl md:text-5xl tracking-tighter">Flash Sale</h2>
                <p className="text-white/80 font-bold text-lg">Giảm giá đến 50% - Chỉ còn 24h</p>
              </div>
            </div>
            <Link href="/search?sortBy=price_asc" className="bg-white text-red-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all flex items-center gap-2">
              Xem tất cả <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tours.slice(0, 3).map((tour, idx) => (
              <Link href={`/tour/${tour.id}`} key={tour.id} className="bg-white rounded-[32px] overflow-hidden shadow-2xl hover:shadow-3xl transition-all group">
                <div className="relative h-[250px]">
                  <img
                    src={tour.tour_images[0]?.image_url || "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={tour.title}
                  />
                  <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-xl font-black text-sm">
                    -{30 + idx * 5}%
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-2">{tour.title}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-slate-400 font-bold line-through">{(Number(tour.price) * 1.3).toLocaleString()}đ</p>
                    <p className="text-red-600 font-black text-2xl">{Number(tour.price).toLocaleString()}đ</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Bán chạy nhất</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">Tour được yêu thích</h2>
            <p className="text-slate-600 font-bold text-lg max-w-2xl mx-auto">Những tour được khách hàng đánh giá cao nhất</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tours.slice(0, 3).map((tour, idx) => (
              <Link href={`/tour/${tour.id}`} key={tour.id} className="group">
                <div className="relative h-[350px] rounded-[40px] overflow-hidden mb-6 shadow-2xl">
                  <img
                    src={tour.tour_images[0]?.image_url || "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={tour.title}
                  />
                  <div className="absolute top-6 right-6 bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
                    <Crown size={16} />
                    Top {idx + 1}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{tour.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="text-yellow-400 fill-yellow-400" size={16} />
                      ))}
                    </div>
                    <span className="text-slate-400 font-bold text-sm">({50 + idx * 10} đánh giá)</span>
                  </div>
                  <p className="text-blue-600 font-black text-2xl tracking-tighter">{Number(tour.price).toLocaleString()}đ</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-slate-50 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Tại sao chọn chúng tôi</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">Cam kết chất lượng</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Bảo hiểm toàn diện", desc: "Bảo hiểm du lịch 100%", highlight: true },
              { icon: Clock, title: "Hỗ trợ 24/7", desc: "Hotline: 0862 640 720", highlight: false },
              { icon: Award, title: "Hướng dẫn viên chuyên nghiệp", desc: "Đội ngũ tốt nhất", highlight: false },
              { icon: CheckCircle, title: "Hoàn tiền dễ dàng", desc: "Chính sách linh hoạt", highlight: false }
            ].map((item, idx) => (
              <div key={idx} className={`bg-white p-8 rounded-[32px] text-center shadow-lg hover:shadow-xl transition-all ${item.highlight ? 'ring-2 ring-blue-500' : ''}`}>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${item.highlight ? 'bg-blue-600' : 'bg-blue-100'}`}>
                  <item.icon className={item.highlight ? 'text-white' : 'text-blue-600'} size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">{item.title}</h3>
                <p className="text-slate-600 font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Khách hàng hài lòng" },
              { value: "500+", label: "Tour chất lượng" },
              { value: "50+", label: "Điểm đến" },
              { value: "99%", label: "Đánh giá 5 sao" }
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-white font-black text-4xl md:text-6xl tracking-tighter mb-2">{stat.value}</p>
                <p className="text-white/80 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Đánh giá khách hàng</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">Khách hàng nói gì</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Nguyễn Văn A", tour: "Tour Đà Nẵng 3N2Đ", rating: 5, comment: "Dịch vụ tuyệt vời, hướng dẫn viên rất nhiệt tình. Sẽ quay lại!" },
              { name: "Trần Thị B", tour: "Tour Nha Trang 4N3Đ", rating: 5, comment: "Giá cả hợp lý, lịch trình thú vị. Rất hài lòng!" },
              { name: "Lê Văn C", tour: "Tour Phú Quốc 3N2Đ", rating: 5, comment: "Đảo đẹp, biển xanh, khách sạn sang trọng. 10 điểm!" }
            ].map((review, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-[32px]">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                  ))}
                </div>
                {/* 🔥 ĐÃ FIX LỖI 470: Thay thế cặp dấu ngoặc kép trần bằng mã thực thể an toàn &quot; */}
                <p className="text-slate-700 font-bold mb-6">&quot;{review.comment}&quot;</p>
                <div>
                  <p className="text-slate-900 font-black">{review.name}</p>
                  <p className="text-slate-500 font-bold text-sm">{review.tour}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <p className="text-center text-slate-400 font-black uppercase tracking-widest mb-8 text-sm">Đối tác tin cậy</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {["Vietnam Airlines", "Vietjet", "Saigon Tourist", "Ben Thanh Tourist", "Hanoitourist"].map((partner, idx) => (
              <div key={idx} className="text-slate-600 font-black text-xl">{partner}</div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}