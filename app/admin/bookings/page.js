import { prisma } from "@/lib/prisma";

export default async function ManageBookings() {
  const bookings = await prisma.bookings.findMany({
    include: { tour: true }, // Nhớ include tour để lấy tên tour nhé ní
    orderBy: { id: 'desc' }
  });

  return (
    <main className="p-10">
      <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">Đơn đặt tour mới</h1>
      <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Mã đơn</th>
              <th className="px-8 py-5">Tên Tour</th>
              <th className="px-8 py-5">Tổng tiền</th>
              <th className="px-8 py-5">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition">
                <td className="px-8 py-6 font-black text-blue-600">#VT-{item.id}</td>
                <td className="px-8 py-6 font-bold">{item.tour?.title}</td>
                <td className="px-8 py-6 font-black">{Number(item.total_amount).toLocaleString()}đ</td>
                <td className="px-8 py-6">
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Chờ thanh toán</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}