import { prisma } from "@/lib/prisma";
import { User, Phone, Mail, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function ManageCustomers({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [customers, totalCount] = await Promise.all([
    prisma.customers.findMany({
      where: {
        is_deleted: false,
        ...(query && {
          OR: [
            { full_name: { contains: query } },
            { phone_number: { contains: query } },
            { email: { contains: query } }
          ]
        })
      },
      orderBy: { id: 'desc' },
      skip,
      take: limit
    }),
    prisma.customers.count({
      where: {
        is_deleted: false,
        ...(query && {
          OR: [
            { full_name: { contains: query } },
            { phone_number: { contains: query } },
            { email: { contains: query } }
          ]
        })
      }
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">👥 Quản lý Khách hàng</h1>
              <p className="text-blue-100">Tổng cộng {totalCount} khách hàng trong hệ thống</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="q"
                  placeholder="Tìm kiếm theo tên, SĐT, hoặc email..."
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

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thông tin</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Liên hệ</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Ngày tham gia</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">#{customer.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{customer.full_name}</p>
                          <p className="text-xs text-slate-500">
                            {customer.is_male ? 'Nam' : 'Nữ'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.phone_number && (
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Phone size={14} />
                            {customer.phone_number}
                          </p>
                        )}
                        {customer.email && (
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Mail size={14} />
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {customer.created_at 
                          ? new Date(customer.created_at).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/customers/${customer.id}/edit`}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-2 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm(`Xóa khách hàng ${customer.full_name}?`)) {
                              try {
                                await fetch(`/api/customers/${customer.id}`, {
                                  method: 'DELETE'
                                });
                                window.location.reload();
                              } catch (error) {
                                alert('Lỗi xóa khách hàng');
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
                Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} khách hàng
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
    </div>
  );
}
