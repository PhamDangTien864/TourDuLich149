import { prisma } from "@/lib/prisma";
import { Ticket, Calendar, Percent, CheckCircle } from "lucide-react";

export default async function PromotionsPage() {
  const promotions = await prisma.promotions.findMany({
    where: {
      is_active: true,
      end_date: { gte: new Date() }
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-800 mb-4 flex items-center justify-center gap-3">
            <Ticket className="text-green-600" size={40} />
            Khuyến Mãi Đặc Biệt
          </h1>
          <p className="text-slate-600 font-bold text-lg">Săn mã giảm giá và ưu đãi hấp dẫn cho chuyến đi của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black">{promo.code}</span>
                  {promo.discount_type === 'percentage' ? (
                    <Percent size={32} />
                  ) : (
                    <Ticket size={32} />
                  )}
                </div>
                <div className="text-2xl font-black">
                  {promo.discount_type === 'percentage' 
                    ? `Giảm ${Number(promo.discount_value)}%` 
                    : `Giảm ${Number(promo.discount_value).toLocaleString()}đ`
                  }
                </div>
              </div>
              
              <div className="p-6">
                {promo.description && (
                  <p className="text-slate-600 mb-4">{promo.description}</p>
                )}
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={16} className="text-green-600" />
                    <span className="font-bold">
                      {new Date(promo.start_date).toLocaleDateString('vi-VN')} - {new Date(promo.end_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  {promo.min_amount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="font-bold">
                        Đơn tối thiểu: {Number(promo.min_amount).toLocaleString()}đ
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-bold">
                      Đã dùng: {promo.used_count || 0} lần
                    </span>
                  </div>
                </div>
                
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black uppercase tracking-widest transition-colors">
                  Sử dụng mã
                </button>
              </div>
            </div>
          ))}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-16">
            <Ticket className="text-slate-300 mx-auto mb-4" size={64} />
            <p className="text-slate-500 font-bold text-lg">Hiện không có khuyến mãi nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
