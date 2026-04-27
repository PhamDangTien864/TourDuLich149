import { prisma } from "@/lib/prisma";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Search, Filter, Download } from "lucide-react";
import Link from "next/link";

export default async function ManagePromotions({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "";
  const page = parseInt(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Lấy danh sách promotions với phân trang và tìm kiếm
  const [promotions, totalCount] = await Promise.all([
    prisma.promotions.findMany({
      where: {
        ...(query && {
          OR: [
            { code: { contains: query } },
            { description: { contains: query } }
          ]
        }),
        ...(status && {
          is_active: status === 'active'
        })
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    }),
    prisma.promotions.count({
      where: {
        ...(query && {
          OR: [
            { code: { contains: query } },
            { description: { contains: query } }
          ]
        }),
        ...(status && {
          is_active: status === 'active'
        })
      }
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">🎟️ Quản lý Khuyến mãi</h1>
              <p className="text-green-100">Tổng cộng {totalCount} mã khuyến mãi</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/promotions/create"
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Tạo mã mới
              </Link>
            </div>
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
                  placeholder="Tìm kiếm theo mã hoặc mô tả..."
                  defaultValue={query}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                name="status"
                defaultValue={status}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-green-600 outline-none transition-all"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã tắt</option>
              </select>
              <button className="bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 transition-colors flex items-center gap-2">
                <Filter size={18} />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Mã</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Mô tả</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Giảm giá</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Giá tối thiểu</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thời gian</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Đã dùng</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{promo.description || 'Không có mô tả'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">
                          {promo.discount_type === 'percentage' ? `${Number(promo.discount_value)}%` : `${Number(promo.discount_value).toLocaleString()}đ`}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          ({promo.discount_type === 'percentage' ? '%' : 'cố định'})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-600">
                        {Number(promo.min_amount || 0).toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600">
                          {new Date(promo.start_date).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-slate-400">
                          → {new Date(promo.end_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-blue-600">{promo.used_count || 0} lần</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        promo.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {promo.is_active ? 'Đang hoạt động' : 'Đã tắt'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/promotions/${promo.id}/edit`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm(`${promo.is_active ? 'Tắt' : 'Bật'} mã khuyến mãi ${promo.code}?`)) {
                              try {
                                await fetch(`/api/promotions/${promo.id}/toggle`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ is_active: !promo.is_active })
                                });
                                window.location.reload();
                              } catch (error) {
                                alert('Lỗi cập nhật trạng thái');
                              }
                            }
                          }}
                          className={`${promo.is_active ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-green-100 hover:bg-green-200 text-green-600'} p-2 rounded-lg transition-colors`}
                          title={promo.is_active ? 'Tắt' : 'Bật'}
                        >
                          {promo.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Xóa mã khuyến mãi ${promo.code}?`)) {
                              try {
                                await fetch(`/api/promotions/${promo.id}`, {
                                  method: 'DELETE'
                                });
                                window.location.reload();
                              } catch (error) {
                                alert('Lỗi xóa mã khuyến mãi');
                              }
                            }
                          }}
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
                Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} mã khuyến mãi
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link 
                    href={`?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Trước
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`?page=${pageNum}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}`}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNum === page
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link 
                    href={`?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}`}
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
