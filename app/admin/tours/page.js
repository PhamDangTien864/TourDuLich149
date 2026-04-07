import { prisma } from "@/lib/prisma";
import AdminSidebar from "../components/AdminSidebar";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";

export default async function ManageTours() {
  const tours = await prisma.tours.findMany({
    where: { is_deleted: false },
    include: { category: true }
  });

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-800">Quản lý danh sách Tour</h1>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-lg transition">
            <Plus size={20} /> Thêm Tour mới
          </button>
        </div>

        <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Tên Tour & Địa điểm</th>
                <th className="px-8 py-5">Giá</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tours.map(tour => (
                <tr key={tour.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800">{tour.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-bold mt-1">
                      <MapPin size={12} /> {tour.location_name}
                    </p>
                  </td>
                  <td className="px-8 py-6 font-black text-blue-600">{Number(tour.price).toLocaleString()}đ</td>
                  <td className="px-8 py-6">
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Đang hiện</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition"><Edit size={18} /></button>
                      <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-600 hover:text-white transition"><Trash2 size={18} /></button>
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