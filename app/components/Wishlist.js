  "use client";

  import { useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import { Heart, MapPin, Calendar } from "lucide-react";

  export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const fetchWishlist = async () => {
        try {
          const response = await fetch('/api/wishlist');
          const data = await response.json();
          if (data.success) {
            setWishlist(data.wishlist || []);
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWishlist();
    }, []);

    const removeFromWishlist = async (tourId) => {
      try {
        await fetch(`/api/wishlist/${tourId}`, { method: 'DELETE' });
        setWishlist(wishlist.filter(item => item.tour.id !== tourId));
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    };

    const viewTourDetail = (tourId) => {
      router.push(`/tour/${tourId}`);
    };

    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách yêu thích ({wishlist.length})</h2>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={item.tours.tour_images?.[0]?.image_url || "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"}
                    alt={item.tours.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.tour.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart size={20} className="text-red-500 fill-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.tours.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin size={14} />
                    <span>{item.tours.location_name}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xl font-bold text-blue-600">
                      {Number(item.tours.price).toLocaleString()}đ
                    </p>
                  </div>

                  <button
                    onClick={() => viewTourDetail(item.tour.id)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Heart size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có tour yêu thích</h3>
            <p className="text-gray-600 mb-6">Thêm các tour bạn thích vào danh sách xem sau!</p>
            <button
              onClick={() => router.push('/search')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Khám phá tour
            </button>
          </div>
        )}
      </div>
    );
  }
