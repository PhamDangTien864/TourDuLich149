import { prisma } from "@/lib/prisma";
import { Package, Users, ShoppingCart, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  // GIẢ SỬ: Ní lấy role_id từ session sau khi login. 
  // Ở đây mình tạm để là 1 (Admin) để ní thấy full chức năng.
  const userRole = 1; 

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
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - Nâng cấp link thật */}
      <aside className="w-64 bg-slate-900 text-white p-8 hidden md:block">
        <Link href="/" className="text-2xl font-black mb-10 block text-blue-400 italic">VietTravel</Link>
        <nav className="space-y-4">
          <Link href="/admin" className="text-blue-400 font-bold bg-blue-400/10 p-4 rounded-2xl flex items-center gap-3">
            <Package size={20} /> Dashboard
          </Link>
          <Link href="/admin/bookings" className="text-slate-400 hover:text-white p-4 flex items-center gap-3 transition">
            <ShoppingCart size={20} /> Đơn đặt tour
          </Link>
          {userRole === 1 && ( // Chỉ Admin mới thấy quản lý nhân sự
            <Link href="/admin/accounts" className="text-slate-400 hover:text-white p-4 flex items-center gap-3 transition">
              <Users size={20} /> Nhân sự (Admin)
            </Link>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Hệ thống Quản trị</h1>
            <p className="text-slate-400 font-bold text-sm uppercase">Quyền hạn: {userRole === 1 ? "Quản trị viên" : "Nhân viên"}</p>
          </div>
          
          {/* Nút thêm tour chỉ dành cho Admin */}
          {userRole === 1 && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[20px] font-black flex items-center gap-3 transition shadow-xl shadow-blue-100">
              <Plus size={24} /> Tạo Tour Luxury
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard icon={<Package className="text-blue-600" />} label="Tổng số Tour" value={tourCount} color="bg-blue-50" />
          <StatCard icon={<Users className="text-purple-600" />} label="Khách hàng" value={customerCount} color="bg-purple-50" />
          <StatCard icon={<ShoppingCart className="text-orange-600" />} label="Đơn mới" value={bookingCount} color="bg-orange-50" />
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-xl text-slate-800">Kho dữ liệu Tour</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Sản phẩm</th>
                <th className="px-8 py-5">Phân loại</th>
                <th className="px-8 py-5 text-right">Giá niêm yết</th>
                {userRole === 1 && <th className="px-8 py-5 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tours.map(tour => (
                <tr key={tour.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-6 font-bold text-slate-700">{tour.title}</td>
                  <td className="px-8 py-6">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {tour.category?.category_name || "Trong nước"}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900 text-right text-lg">
                    {Number(tour.price).toLocaleString()}đ
                  </td>
                  {userRole === 1 && ( // Chỉ Admin mới có nút sửa xóa
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><Edit size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  )}
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
    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition">
      <div className={`p-5 rounded-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}