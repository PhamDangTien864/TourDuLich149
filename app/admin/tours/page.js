import { prisma } from "@/lib/prisma";
import AdminLayout from "../components/AdminLayout";
import { Plus, MapPin, Search, Filter } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import TourActions from "./components/TourActions";

export default async function ManageTours({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Lấy danh sách tours với phân trang và tìm kiếm
  const [tours, totalCount] = await Promise.all([
    prisma.tours.findMany({
      where: {
        is_deleted: false,
        ...(query && {
          OR: [
            { title: { contains: query } },
            { location_name: { contains: query } }
          ]
        })
      },
      include: { category: true },
      orderBy: { id: 'desc' },
      skip,
      take: limit
    }),
    prisma.tours.count({
      where: {
        is_deleted: false,
        ...(query && {
          OR: [
            { title: { contains: query } },
            { location_name: { contains: query } }
          ]
        })
      }
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">🛡️ Quản lý Tours</h1>
              <p className="text-blue-100">Tổng cộng {totalCount} tours trong hệ thống</p>
            </div>
            <Link 
              href="/admin/tours/new"
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Thêm Tour Mới
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="q"
                  placeholder="Tìm kiếm theo tên tour hoặc địa điểm..."
                  defaultValue={query}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <button className="bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 transition-colors flex items-center gap-2">
              <Filter size={18} />
              Bộ lọc
            </button>
          </div>
        </div>

        {/* Tours Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Tour</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Địa điểm</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Giá</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">#{tour.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden relative">
                          <Image 
                            src={tour.sub_title || "https://images.unsplash.com/photo-1528127269322-539801943592?w=100"} 
                            alt={tour.title}
                            className="w-full h-full object-cover"
                            fill
                            sizes="(max-width: 48px)"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{tour.title}</p>
                          <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block mt-1">
                            {tour.category?.category_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={16} />
                        {tour.location_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        {Number(tour.price).toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        tour.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tour.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <TourActions tour={tour} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} tours
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link 
                    href={`?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Trước
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`?page=${pageNum}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link 
                    href={`?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Sau
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}