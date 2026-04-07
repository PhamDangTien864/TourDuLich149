import { prisma } from "@/lib/prisma";
import { Search, MapPin, ArrowRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || "";

  // Tìm kiếm tour theo tiêu đề hoặc địa điểm
  const searchResults = await prisma.tours.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { location_name: { contains: query } }
      ],
      is_deleted: false
    },
    include: { category: true }
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Kết quả cho: "{query}"</h1>
          <p className="text-slate-500 font-bold">Tìm thấy {searchResults.length} tour phù hợp</p>
        </div>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {searchResults.map(tour => (
              <Link href={`/tour/${tour.id}`} key={tour.id} className="group bg-white rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100">
                <div className="h-48 bg-slate-100 rounded-2xl mb-6 overflow-hidden">
                  <img src={tour.sub_title || "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=400"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-800 line-clamp-1">{tour.title}</h3>
                <div className="flex items-center gap-1 text-slate-400 text-sm font-bold mb-4">
                  <MapPin size={14} /> {tour.location_name}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                   <p className="text-xl font-black text-blue-600">{Number(tour.price).toLocaleString()}đ</p>
                   <ArrowRight className="text-blue-600" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <Search className="mx-auto text-slate-200 mb-6" size={64} />
            <h2 className="text-2xl font-black text-slate-400">Không tìm thấy tour nào ní ơi!</h2>
            <Link href="/" className="text-blue-600 font-black mt-4 block hover:underline">Quay lại trang chủ</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}