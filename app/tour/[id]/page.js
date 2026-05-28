import { prisma } from "@/lib/prisma";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import dynamic from "next/dynamic";
import { MapPin, Info, CheckCircle2, Star, ShieldCheck, Calendar, Users, Clock, Bus, Plane, Car, ChevronRight, X, Image as ImageIcon, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import { generateTourSchema, generateBreadcrumbSchema, generateFAQSchema, generateReviewSchema } from "@/lib/seo/structured-data";
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import TourMap from "../../components/TourMap";

// Lazy load heavy components
const MultiStepBooking = dynamic(() => import("../../components/MultiStepBooking"), {
  loading: () => <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
});

const ReviewSystem = dynamic(() => import("../../components/ReviewSystem"), {
  loading: () => <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
});

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://viettravel.com';
  const tourUrl = `${baseUrl}/tour/${id}`;

  return {
    title: `${tour?.title || "Tour du lịch"} | VietTravel Luxury`,
    description: tour?.description?.substring(0, 160) || "Khám phá Việt Nam cùng VietTravel Luxury",
    alternates: {
      canonical: tourUrl,
    },
    openGraph: {
      title: tour?.title || "Tour du lịch",
      description: tour?.description?.substring(0, 160) || "Khám phá Việt Nam cùng VietTravel Luxury",
      url: tourUrl,
      siteName: 'VietTravel Luxury',
      images: tour?.tour_images?.map(img => ({
        url: img.image_url,
        width: 1200,
        height: 630,
        alt: tour?.title || 'Tour du lịch'
      })) || [],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tour?.title || "Tour du lịch",
      description: tour?.description?.substring(0, 160) || "Khám phá Việt Nam cùng VietTravel Luxury",
      images: tour?.tour_images?.[0]?.image_url || [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function TourDetailPage({ params }) {
  // BẮT BUỘC: Giải nén params bằng await để tránh lỗi P1001/Validation
  const { id } = await params; 

  // Validate id
  if (!id || isNaN(Number(id))) {
    return notFound();
  }

  const tourId = Number(id);
  
  // Check cache first
  const cacheKey = CACHE_KEYS.TOUR_DETAIL(tourId);
  let tour = cache.get(cacheKey);
  
  if (!tour) {
    tour = await prisma.tours.findUnique({
      where: { id: tourId },
      include: { 
        tour_categories: true, 
        tour_images: {
          orderBy: { is_primary: 'desc' }
        },
        tour_itinerary: {
          orderBy: { day_number: 'asc' }
        },
        tour_inclusions: true,
        tour_exclusions: true,
        departure_schedules: {
          where: { is_active: true },
          orderBy: { departure_date: 'asc' }
        },
        cancellation_policies: {
          where: { is_default: true }
        }
      }
    });

    if (tour) {
      cache.set(cacheKey, tour, CACHE_TTL.MEDIUM);
    }
  }

  if (!tour) return notFound();

  // Fetch reviews for structured data
  const reviewsCacheKey = `tour_reviews:${tourId}`;
  let reviews = cache.get(reviewsCacheKey);
  
  if (!reviews) {
    reviews = await prisma.reviews.findMany({
      where: {
        tour_id: tourId,
        is_deleted: false
      },
      include: {
        accounts: {
          select: {
            full_name: true
          }
        }
      },
      take: 10
    });
    
    cache.set(reviewsCacheKey, reviews, CACHE_TTL.MEDIUM);
  }

  // Fetch similar tours with caching
  const similarToursCacheKey = `similar_tours:${tourId}`;
  let similarTours = cache.get(similarToursCacheKey);
  
  if (!similarTours) {
    similarTours = await prisma.tours.findMany({
      where: {
        id: { not: tour.id },
        is_active: true,
        is_deleted: false,
        OR: [
          { province_id: tour.province_id },
          { category_id: tour.category_id }
        ]
      },
      take: 4,
      include: {
        tour_images: { take: 1 }
      }
    });
    
    cache.set(similarToursCacheKey, similarTours, CACHE_TTL.LONG);
  }

  // Fetch applicable promotions for this tour with caching
  const promotionsCacheKey = `promotions:${tourId}`;
  let applicablePromotions = cache.get(promotionsCacheKey);
  
  if (!applicablePromotions) {
    const now = new Date();
    applicablePromotions = await prisma.promotions.findMany({
      where: {
        is_active: true,
        start_date: { lte: now },
        end_date: { gte: now },
        OR: [
          { category_name: null },
          { category_name: tour.tour_categories?.category_name }
        ]
      },
      orderBy: { discount_value: 'desc' }
    });
    
    cache.set(promotionsCacheKey, applicablePromotions, CACHE_TTL.SHORT);
  }

  // Calculate best discount
  let bestDiscount = null;
  let discountedPrice = Number(tour.price);

  if (applicablePromotions.length > 0) {
    for (const promo of applicablePromotions) {
      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = (Number(tour.price) * Number(promo.discount_value)) / 100;
      } else {
        discountAmount = Number(promo.discount_value);
      }
      
      if (discountAmount > 0) {
        const finalPrice = Math.max(0, Number(tour.price) - discountAmount);
        if (finalPrice < discountedPrice) {
          discountedPrice = finalPrice;
          bestDiscount = {
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            discount_amount: discountAmount
          };
        }
      }
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateTourSchema(tour))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema([
            { name: 'Trang chủ', url: process.env.NEXT_PUBLIC_BASE_URL || 'https://viettravel.vn' },
            { name: tour.title, url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://viettravel.vn'}/tour/${tour.id}` }
          ]))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema([
            { question: "Tour có bao gồm vé máy bay không?", answer: "Tùy theo loại tour, một số tour bao gồm vé máy bay, một số khác không. Vui lòng kiểm tra chi tiết trong phần Dịch vụ bao gồm." },
            { question: "Tôi có thể hủy tour không?", answer: "Có, bạn có thể hủy tour theo chính sách hủy được hiển thị ở trên. Hoàn tiền sẽ được tính dựa trên thời gian hủy." },
            { question: "Tour có phù hợp cho trẻ em không?", answer: "Hầu hết các tour đều phù hợp cho trẻ em. Vui lòng kiểm tra độ tuổi tối thiểu trong thông tin tour." },
            { question: "Tôi cần chuẩn bị gì cho chuyến đi?", answer: "Bạn nên mang theo giấy tờ tùy thân, quần áo phù hợp, thuốc cá nhân và các vật dụng cần thiết theo lịch trình." }
          ]))
        }}
      />
      {reviews.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateReviewSchema(tour, reviews))
          }}
        />
      )}
      
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
                  {tour.tour_categories?.category_name || "Tour Đặc Sắc"}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <MapPin size={18} /> {tour.location_name}
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <Star size={18} fill="currentColor" /> 4.9 (Đánh giá cao)
                </span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="rounded-[48px] overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Main Image */}
                <div className="relative h-[400px] md:h-[500px] md:col-span-2 rounded-[32px] overflow-hidden">
                  <Image 
                    src={tour.tour_images[0]?.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" 
                    alt={tour.title}
                    fill
                    sizes="(max-width: 1200px)"
                    priority
                  />
                  {tour.tour_images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-black">
                      {tour.tour_images.length} ảnh
                    </div>
                  )}
                </div>
                {/* Thumbnail Images */}
                {tour.tour_images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="relative h-[200px] rounded-[32px] overflow-hidden">
                    <Image 
                      src={img.image_url} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                      alt={`${tour.title} ${idx + 2}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tour Info Badges */}
            <div className="flex flex-wrap gap-4">
              {tour.transport_type && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-sm">
                  {tour.transport_type === 'bus' && <Bus size={18} />}
                  {tour.transport_type === 'flight' && <Plane size={18} />}
                  {tour.transport_type === 'train' && <Car size={18} />}
                  {tour.transport_type === 'private_car' && <Car size={18} />}
                  {tour.transport_type}
                </div>
              )}
              {tour.duration_days && (
                <div className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-black text-sm">
                  <Clock size={18} />
                  {tour.duration_days} ngày
                </div>
              )}
              {tour.max_slots && (
                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl font-black text-sm">
                  <Users size={18} />
                  Tối đa {tour.max_slots} khách
                </div>
              )}
            </div>

            {/* Day-by-day Itinerary */}
            {tour.tour_itinerary && tour.tour_itinerary.length > 0 && (
              <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <Calendar className="text-blue-600" /> Lịch trình chi tiết
                </h3>
                <div className="space-y-6">
                  {tour.tour_itinerary.map((day, idx) => (
                    <div key={day.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {day.day_number}
                      </div>
                      <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-black text-slate-800 mb-3 text-lg">Ngày {day.day_number}: {day.title}</h4>
                        <p className="text-slate-600 mb-4 leading-relaxed">{day.description}</p>
                        <div className="flex flex-wrap gap-3">
                          {day.activities && (
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-sm font-bold">
                              <CheckCircle2 size={14} />
                              {day.activities}
                            </div>
                          )}
                          {day.meals && (
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-bold">
                              {day.meals}
                            </div>
                          )}
                          {day.accommodation && (
                            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-xl text-sm font-bold">
                              {day.accommodation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included/Excluded Services */}
            {(tour.tour_inclusions?.length > 0 || tour.tour_exclusions?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tour.tour_inclusions && tour.tour_inclusions.length > 0 && (
                  <div className="bg-green-50 rounded-[40px] p-8 md:p-12 border border-green-100">
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-green-700">
                      <CheckCircle2 /> Dịch vụ bao gồm
                    </h3>
                    <ul className="space-y-3">
                      {tour.tour_inclusions.map((item) => (
                        <li key={item.id} className="flex items-start gap-3">
                          <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                          <div>
                            <p className="font-black text-slate-800">{item.title}</p>
                            {item.description && <p className="text-slate-600 text-sm">{item.description}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tour.tour_exclusions && tour.tour_exclusions.length > 0 && (
                  <div className="bg-red-50 rounded-[40px] p-8 md:p-12 border border-red-100">
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-red-700">
                      <X /> Dịch vụ không bao gồm
                    </h3>
                    <ul className="space-y-3">
                      {tour.tour_exclusions.map((item) => (
                        <li key={item.id} className="flex items-start gap-3">
                          <X className="text-red-600 flex-shrink-0 mt-1" size={20} />
                          <div>
                            <p className="font-black text-slate-800">{item.title}</p>
                            {item.description && <p className="text-slate-600 text-sm">{item.description}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Departure Schedules */}
            {tour.departure_schedules && tour.departure_schedules.length > 0 && (
              <div className="bg-blue-50 rounded-[40px] p-8 md:p-12 border border-blue-100">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-blue-700">
                  <Calendar /> Lịch khởi hành
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tour.departure_schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-black text-slate-800 text-lg">
                          {new Date(schedule.departure_date).toLocaleDateString('vi-VN')}
                        </p>
                        {schedule.available_slots > 5 ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-black">
                            Còn {schedule.available_slots} chỗ
                          </span>
                        ) : (
                          <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-black">
                            Sắp hết
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Users size={16} />
                        Tổng: {schedule.total_slots} chỗ
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {tour.cancellation_policies && tour.cancellation_policies.length > 0 && (
              <div className="bg-yellow-50 rounded-[40px] p-8 md:p-12 border border-yellow-100">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-yellow-700">
                  <ShieldCheck /> Chính sách hủy
                </h3>
                <div className="space-y-4">
                  {tour.cancellation_policies.map((policy) => (
                    <div key={policy.id} className="bg-white p-6 rounded-2xl border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-black text-slate-800">Hủy trước {policy.days_before} ngày</p>
                        <p className="font-black text-green-600 text-xl">{policy.refund_percent}% hoàn tiền</p>
                      </div>
                      {policy.description && <p className="text-slate-600 text-sm">{policy.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bản đồ */}
            <TourMap 
              mapUrl={tour.map_url} 
              tourTitle={tour.title} 
              locationName={tour.location_name} 
            />

            {/* FAQ Section */}
            <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Info className="text-blue-600" /> Câu hỏi thường gặp
              </h3>
              <div className="space-y-4">
                {[
                  { q: "Tour có bao gồm vé máy bay không?", a: "Tùy theo loại tour, một số tour bao gồm vé máy bay, một số khác không. Vui lòng kiểm tra chi tiết trong phần Dịch vụ bao gồm." },
                  { q: "Tôi có thể hủy tour không?", a: "Có, bạn có thể hủy tour theo chính sách hủy được hiển thị ở trên. Hoàn tiền sẽ được tính dựa trên thời gian hủy." },
                  { q: "Tour có phù hợp cho trẻ em không?", a: "Hầu hết các tour đều phù hợp cho trẻ em. Vui lòng kiểm tra độ tuổi tối thiểu trong thông tin tour." },
                  { q: "Tôi cần chuẩn bị gì cho chuyến đi?", a: "Bạn nên mang theo giấy tờ tùy thân, quần áo phù hợp, thuốc cá nhân và các vật dụng cần thiết theo lịch trình." }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-black text-slate-800 mb-2">{faq.q}</h4>
                    <p className="text-slate-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Tours */}
            {similarTours && similarTours.length > 0 && (
              <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <MapPin className="text-blue-600" /> Tour tương tự
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {similarTours.map((similarTour) => (
                    <Link href={`/tour/${similarTour.id}`} key={similarTour.id} className="group">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                        <div className="relative h-[200px]">
                          <Image
                            src={similarTour.tour_images[0]?.image_url || "https://images.unsplash.com/photo-1528127269322-539801943592?w=400"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={similarTour.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-black text-slate-800 mb-2 line-clamp-1">{similarTour.title}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-blue-600 font-black">{Number(similarTour.price).toLocaleString()}đ</p>
                            <ArrowRight className="text-blue-600" size={18} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Đánh giá */}
            <ReviewSystem tourId={tour.id} />
          </div>

          {/* Cột phải: Form đặt chỗ */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[48px] p-8 md:p-10 text-white shadow-2xl sticky top-28 border border-white/5 hidden lg:block">
              <div className="mb-8">
                {bestDiscount ? (
                  <>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Giá gốc</p>
                    <p className="text-2xl font-black text-slate-400 line-through mb-2">
                      {Number(tour.price).toLocaleString()}đ
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-black">
                        -{bestDiscount.discount_type === 'percentage' ? `${bestDiscount.discount_value}%` : `${Number(bestDiscount.discount_value).toLocaleString()}đ`}
                      </span>
                      <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        Flash Sale
                      </span>
                    </div>
                    <h2 className="text-5xl font-black text-green-400">
                      {discountedPrice.toLocaleString()}đ
                    </h2>
                    <div className="mt-3 bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3">
                      <p className="text-green-300 text-xs font-bold">
                        Mã: {bestDiscount.code}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Giá khởi hành</p>
                    <h2 className="text-5xl font-black text-blue-400">
                      {Number(tour.price).toLocaleString()}đ
                    </h2>
                    <p className="text-slate-400 text-xs font-bold mt-2">/ khách</p>
                  </>
                )}
              </div>

              {/* Form đặt tour - Truyền dữ liệu sang component con */}
              <MultiStepBooking tourId={tour.id} price={discountedPrice} originalPrice={tour.price} bestDiscount={bestDiscount} />

              {/* Cam kết dịch vụ */}
              <div className="mt-8 space-y-3 pt-6 border-t border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-blue-500" /> Bảo hiểm du lịch 1 tỷ đồng
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-blue-500" /> Hoàn hủy miễn phí 24h
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-blue-500" /> Hỗ trợ 24/7
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Giá từ</p>
            <p className="text-2xl font-black text-blue-600">
              {discountedPrice.toLocaleString()}đ
            </p>
          </div>
          <Link href={`#booking-form`} className="flex-1">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition min-h-[56px]">
              Đặt ngay
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile booking form section */}
      <div id="booking-form" className="lg:hidden bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl mb-20">
        <div className="mb-6">
          <h3 className="text-2xl font-black mb-4">Đặt tour ngay</h3>
          <MultiStepBooking tourId={tour.id} price={discountedPrice} originalPrice={tour.price} bestDiscount={bestDiscount} />
        </div>
      </div>

      <Footer />
    </div>
  );
}