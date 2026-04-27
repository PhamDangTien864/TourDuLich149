import { prisma } from "@/lib/prisma";
import { Star, MapPin, User } from "lucide-react";

export default async function ReviewsPage() {
  const reviews = await prisma.reviews.findMany({
    where: { is_deleted: false },
    include: {
      tours: { select: { title: true, location_name: true } },
      accounts: { select: { full_name: true } }
    },
    orderBy: { created_at: 'desc' },
    take: 50
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-800 mb-4 flex items-center justify-center gap-3">
            <Star className="text-yellow-500" size={40} />
            Đánh Giá Khách Hàng
          </h1>
          <p className="text-slate-600 font-bold text-lg">Những chia sẻ chân thực từ du khách VietTravel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <User className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{review.accounts?.full_name || 'Khách hàng'}</p>
                    <p className="text-xs text-slate-400 font-bold">
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <MapPin size={16} className="text-yellow-600" />
                  <span className="font-bold">{review.tours?.title}</span>
                </div>
                <p className="text-slate-600">{review.comment || 'Không có nội dung'}</p>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-16">
            <Star className="text-slate-300 mx-auto mb-4" size={64} />
            <p className="text-slate-500 font-bold text-lg">Chưa có đánh giá nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
