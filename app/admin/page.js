import { prisma } from "@/lib/prisma";
import { Package, Users, ShoppingCart, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  // 1. Lấy thống kê thực tế từ Database
  const [tourCount, customerCount, bookingCount, tours] = await Promise.all([
    prisma.tours.count({ where: { is_deleted: false } }),
    prisma.customers.count({ where: { is_deleted: false } }),
    prisma.bookings.count(),
    prisma.tours.findMany({ 
      where: { is_deleted: false },
      include: { category: true },
      orderBy: { id: "desc" } 
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar giả lập */}
      <aside className="w-64 bg-slate-900 text-white p-8 hidden md:block">
        <h2 className="text-2xl font-black mb-10 text-blue-400">VietTravel</h2>
        <nav className="space-y-6">
          <div className="text-blue-400 font-bold bg-blue-400/10 p-3 rounded-xl flex items-center gap-3">
            <Package size={20} /> Quản lý Tour
          </div>
          <div className="text-slate-400 hover:text-white transition flex items-center gap-3 cursor-pointer">
            <Users size={20} /> Khách hàng
          </div>
          <div className="text-slate-400 hover:text-white transition flex items-center gap-3 cursor-pointer">
            <ShoppingCart size={20} /> Đơn đặt tour
          </div>
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-8 md:p-12">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Quản trị</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition shadow-lg shadow-blue-200">
            <Plus size={20} /> Thêm Tour mới
          </button>
        </div>

        {/* Thẻ thống kê (Khớp Hình 4.11) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard icon={<Package className="text-blue-600" />} label="Tổng số Tour" value={tourCount} color="bg-blue-50" />
          <StatCard icon={<Users className="text-purple-600" />} label="Khách hàng" value={customerCount} color="bg-purple-50" />
          <StatCard icon={<ShoppingCart className="text-orange-600" />} label="Đơn đặt tour" value={bookingCount} color="bg-orange-50" />
        </div>

        {/* Danh sách Tour */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-xl text-slate-800">Danh sách Tour hiện có</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4 font-bold">Tên Tour</th>
                <th className="px-8 py-4 font-bold">Loại</th>
                <th className="px-8 py-4 font-bold">Giá</th>
                <th className="px-8 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tours.map(tour => (
                <tr key={tour.id} className="hover:bg-slate-50 transition">
                  <td className="px-8 py-6 font-bold text-slate-700">{tour.title}</td>
                  <td className="px-8 py-6"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">{tour.category?.category_name}</span></td>
                  <td className="px-8 py-6 font-black text-slate-900">{Number(tour.price).toLocaleString()}đ</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-3">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><Edit size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
      <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}