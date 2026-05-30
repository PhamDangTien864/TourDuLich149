import { prisma } from "@/lib/prisma";
import { Star, Search, Filter } from "lucide-react";
import Link from "next/link";
import ReviewActions from "./ReviewActions";

export default async function ManageReviews({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const rating = params.rating || "";
  const page = parseInt(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Lấy danh sách reviews với phân trang và tìm kiếm
  const [reviews, totalCount] = await Promise.all([
    prisma.reviews.findMany({
      where: {
        ...(query && {
          OR: [
            { comment: { contains: query } }
          ]
        }),
        ...(rating && {
          rating: parseInt(rating)
        }),
        is_deleted: false
      },
      include: {
        tours: { select: { title: true, location_name: true } },
        accounts: { select: { full_name: true, email: true } }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    }),
    prisma.reviews.count({
      where: {
        ...(query && {
          OR: [
            { comment: { contains: query } }
          ]
        }),
        ...(rating && {
          rating: parseInt(rating)
        }),
        is_deleted: false
      }
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">⭐ Quản lý Đánh giá</h1>
              <p className="text-yellow-100">Tổng cộng {totalCount} đánh giá</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <form method="GET" action="/admin/reviews" className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="q"
                  placeholder="Tìm kiếm theo nội dung..."
                  defaultValue={query}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-yellow-500 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                name="rating"
                defaultValue={rating}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-yellow-500 outline-none transition-all"
              >
                <option value="">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
              <button type="submit" className="bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 transition-colors flex items-center gap-2">
                <Filter size={18} />
                Bộ lọc
              </button>
            </div>
          </form>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Khách hàng</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Tour</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Đánh giá</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Nội dung</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Phản hồi</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Ngày</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800">{review.accounts?.full_name || 'N/A'}</p>
                        <p className="text-xs text-slate-400 font-bold">{review.accounts?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{review.tours?.title}</p>
                        <p className="text-xs text-slate-400 font-bold">{review.tours?.location_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}
                          />
                        ))}
                        <span className="ml-2 font-black text-slate-800">{review.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-xs truncate">
                        {review.comment || 'Không có nội dung'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {review.admin_reply ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">Đã phản hồi</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">Chưa phản hồi</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 font-bold">
                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <ReviewActions 
                        reviewId={review.id} 
                        tourId={review.tour_id} 
                        adminReply={review.admin_reply} 
                      />
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
                Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} đánh giá
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link 
                    href={`?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${rating ? `&rating=${rating}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Trước
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`?page=${pageNum}${query ? `&q=${encodeURIComponent(query)}` : ''}${rating ? `&rating=${rating}` : ''}`}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNum === page
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link 
                    href={`?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${rating ? `&rating=${rating}` : ''}`}
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
    </div>
  );
}
