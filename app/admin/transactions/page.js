import { prisma } from "@/lib/prisma";
import { CreditCard, Search, Filter, Eye, Download } from "lucide-react";
import Link from "next/link";

export default async function ManageTransactions({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const type = params.type || "";
  const page = parseInt(params.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Lấy danh sách transactions với phân trang và tìm kiếm
  const [transactions, totalCount] = await Promise.all([
    prisma.transactions.findMany({
      where: {
        ...(type && {
          transaction_type: type
        })
      },
      include: {
        bookings: {
          include: {
            customers: { select: { full_name: true, phone_number: true } },
            tours: { select: { title: true, location_name: true } }
          }
        },
        accounts: { select: { full_name: true, email: true } },
        promotions: { select: { code: true, discount_value: true } }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    }),
    prisma.transactions.count({
      where: {
        ...(type && {
          transaction_type: type
        })
      }
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Tính tổng doanh thu
  const totalRevenue = await prisma.transactions.aggregate({
    _sum: { amount: true }
  });

  return (
    <div>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">💳 Quản lý Giao dịch</h1>
              <p className="text-purple-100">Tổng cộng {totalCount} giao dịch | Doanh thu: {Number(totalRevenue._sum.amount || 0).toLocaleString()}đ</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2">
                <Download size={16} />
                Xuất Excel
              </button>
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
                  placeholder="Tìm kiếm..."
                  defaultValue={query}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-purple-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                name="type"
                defaultValue={type}
                className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-purple-600 outline-none transition-all"
              >
                <option value="">Tất cả loại</option>
                <option value="payment">Thanh toán</option>
                <option value="refund">Hoàn tiền</option>
              </select>
              <button className="bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 transition-colors flex items-center gap-2">
                <Filter size={18} />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Khách hàng</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Booking</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Số tiền</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Loại</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Khuyến mãi</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Ngày</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">#{transaction.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800">{transaction.accounts?.full_name || 'N/A'}</p>
                        <p className="text-xs text-slate-400 font-bold">{transaction.accounts?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">#{transaction.booking_id}</p>
                        <p className="text-xs text-slate-400 font-bold">{transaction.bookings?.customers?.full_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-black ${
                        transaction.transaction_type === 'payment' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'payment' ? '+' : '-'}
                        {Number(transaction.amount || 0).toLocaleString()}đ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        transaction.transaction_type === 'payment' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.transaction_type === 'payment' ? 'Thanh toán' : 'Hoàn tiền'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {transaction.promotions ? (
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          {transaction.promotions.code}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">Không</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 font-bold">
                        {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/bookings`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                          title="Xem booking"
                        >
                          <Eye size={16} />
                        </Link>
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
                Hiển thị {skip + 1}-{Math.min(skip + limit, totalCount)} của {totalCount} giao dịch
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link 
                    href={`?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${type ? `&type=${type}` : ''}`}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Trước
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`?page=${pageNum}${query ? `&q=${encodeURIComponent(query)}` : ''}${type ? `&type=${type}` : ''}`}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNum === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link 
                    href={`?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}${type ? `&type=${type}` : ''}`}
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
