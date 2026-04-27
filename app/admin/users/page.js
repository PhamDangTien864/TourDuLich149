import { prisma } from "@/lib/prisma";
import { UserCheck, ShieldAlert, UserPlus, Phone, Calendar, Search, Filter } from "lucide-react";
import Link from "next/link";
import UserActions from "./components/UserActions";

export default async function ManageUsers({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Lấy danh sách users với phân trang và tìm kiếm
  const [users, totalCount] = await Promise.all([
    prisma.accounts.findMany({
      where: {
        is_deleted: false,
        ...(query && {
          OR: [
            { full_name: { contains: query } },
            { username: { contains: query } },
            { phone_number: { contains: query } }
          ]
        })
      },
      orderBy: { id: 'desc' },
      skip,
      take: limit
    }),
    prisma.accounts.count({
      where: {
        is_deleted: false,
        ...(query && {
          OR: [
            { full_name: { contains: query } },
            { username: { contains: query } },
            { phone_number: { contains: query } }
          ]
        })
      }
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black mb-2">👥 Quản lý Users</h1>
            <p className="text-blue-100">Tổng cộng {totalCount} người dùng trong hệ thống</p>
          </div>
          <Link 
            href="/admin/users/create"
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
          >
            <UserPlus size={20} />
            Thêm User Mới
          </Link>
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
                  placeholder="Tìm kiếm theo tên, username, hoặc SĐT..."
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

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Username</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Liên hệ</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Vai trò</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Ngày sinh</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">#{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.full_name}</p>
                          <p className="text-xs text-slate-500">
                            {user.birth_date ? new Date(user.birth_date).toLocaleDateString('vi-VN') : "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        @{user.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={16} />
                        {user.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role_id === 1 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role_id === 1 ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {user.birth_date ? new Date(user.birth_date).toLocaleDateString('vi-VN') : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <UserActions user={user} />
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
                Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} users
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