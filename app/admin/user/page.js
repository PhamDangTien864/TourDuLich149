import { prisma } from "@/lib/prisma";
import { Package, Users, ShoppingCart, Plus, MapPin } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  // Lấy dữ liệu thực tế từ Database
  const [tourCount, customerCount, bookingCount, recentTours] = await Promise.all([
    prisma.tours.count({ where: { is_deleted: false } }),
    prisma.accounts.count({ where: { role_id: 2 } }), // Giả sử role 2 là khách
    prisma.bookings.count(),
    prisma.tours.findMany({
      where: { is_deleted: false },
      take: 5,
      orderBy: { id: 'desc' },
      include: { category: true }
    })
  ]);

  return (
    <main className="p-8 md:p-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Dashboard Quản trị</h1>
          <p className="text-slate-400 font-bold mt-1 text-sm uppercase tracking-widest">Hệ thống VietTravel Luxury</p>
        </div>
        <Link href="/admin/tours/add" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95">
          <Plus size={20} /> Thêm Tour mới
        </Link>
      </div>

      {/* Thẻ thống kê (Fix lỗi số 0 trong ảnh của ní) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard icon={<Package className="text-blue-600" />} label="Tổng số Tour" value={tourCount} color="bg-blue-50" />
        <StatCard icon={<Users className="text-purple-600" />} label="Khách hàng" value={customerCount} color="bg-purple-50" />
        <StatCard icon={<ShoppingCart className="text-orange-600" />} label="Đơn đặt tour" value={bookingCount} color="bg-orange-50" />
      </div>

      {/* Bảng danh sách Tour hiện có */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <h3 className="font-black text-xl text-slate-800">Tour mới cập nhật</h3>
           <Link href="/admin/tours" className="text-blue-600 font-black text-sm hover:underline">Xem tất cả</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <tr>
                <th className="px-10 py-5">Tên Tour</th>
                <th className="px-10 py-5">Loại</th>
                <th className="px-10 py-5">Giá</th>
                <th className="px-10 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTours.length > 0 ? recentTours.map(tour => (
                <tr key={tour.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-800">{tour.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {tour.location_name}
                    </p>
                  </td>
                  <td className="px-10 py-6">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                      {tour.category?.category_name}
                    </span>
                  </td>
                  <td className="px-10 py-6 font-black text-slate-900">{Number(tour.price).toLocaleString()}đ</td>
                  <td className="px-10 py-6 text-center">
                    <button className="text-blue-600 font-black text-xs hover:underline">Chi tiết</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center text-slate-300 font-bold italic">Chưa có tour nào trong database ní ơi!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-8 transition-transform hover:scale-[1.02]">
      <div className={`p-5 rounded-[24px] ${color}`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}