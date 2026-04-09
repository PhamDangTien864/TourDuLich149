import { prisma } from "@/lib/prisma";

export default async function ManageBookings() {
  const bookings = await prisma.bookings.findMany({
    // Include cả tour và customer để nhân viên biết ai đặt cái gì
    include: { 
        tour: true, 
        customer: true 
    }, 
    orderBy: { id: 'desc' }
  });

  return (
    <main className="p-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end mb-10">
        <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Xử lý Booking</h1>
            <p className="text-slate-400 font-bold">Danh sách khách hàng đăng ký tour trực tuyến</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
            {bookings.length} Đơn hàng
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Mã đơn</th>
              <th className="px-8 py-5">Khách hàng</th>
              <th className="px-8 py-5">Sản phẩm Tour</th>
              <th className="px-8 py-5 text-right">Thanh toán</th>
              <th className="px-8 py-5 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-700">
            {bookings.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition">
                <td className="px-8 py-6 font-black text-blue-600">#VT-{item.id}</td>
                <td className="px-8 py-6">
                  <div>{item.customer?.full_name}</div>
                  <div className="text-[10px] text-slate-400">{item.customer?.phone_number}</div>
                </td>
                <td className="px-8 py-6">{item.tour?.title}</td>
                <td className="px-8 py-6 text-right font-black">
                    {Number(item.total_amount).toLocaleString()}đ
                </td>
                <td className="px-8 py-6 text-center">
                  {item.is_confirmed ? ( // Kiểm tra trạng thái từ database
                    <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase">
                        Đã xác nhận
                    </span>
                  ) : (
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition shadow-lg shadow-orange-100">
                        Chốt đơn ngay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}