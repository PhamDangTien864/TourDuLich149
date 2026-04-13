  "use client";

  import { useState, useEffect } from "react";
  import { motion } from "framer-motion";

  export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data - will be replaced with API calls
    useEffect(() => {
      const mockWishlist = [
        {
          id: 1,
          tour: {
            id: 1,
            title: "Tour Da Nang 3N2D",
            location_name: "Da Nang",
            price: 2999000,
            sub_title: "Bien dep Da Nang"
          },
          created_at: "2024-01-10"
        },
        {
          id: 2,
          tour: {
            id: 3,
            title: "Tour Ha Noi 2N1D",
            location_name: "Ha Noi",
            price: 1999000,
            sub_title: "Thu do Ha Noi"
          },
          created_at: "2024-01-12"
        },
        {
          id: 3,
          tour: {
            id: 2,
            title: "Tour Phu Quoc 4N3D",
            location_name: "Phu Quoc",
            price: 4999000,
            sub_title: "Dao ngoc Phu Quoc"
          },
          created_at: "2024-01-15"
        }
      ];

      setWishlist(mockWishlist);
      setLoading(false);
    }, []);

    const removeFromWishlist = (tourId) => {
      setWishlist(wishlist.filter(item => item.tour.id !== tourId));
    };

    const addToBooking = (tour) => {
      // Navigate to booking page or open booking modal
      console.log("Navigate to booking for tour:", tour.id);
    };

    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
          <h1 className="text-3xl font-black mb-2">Danh sach yeu thich</h1>
          <p className="text-pink-100">Cac tour ban da luu lai</p>
        </div>

        {/* Wishlist Stats */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {wishlist.length} tour yeu thich
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Tong gia tri: {wishlist.reduce((sum, item) => sum + item.tour.price, 0).toLocaleString()}d
              </p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-colors">
              Dat tat ca
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlist.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1528127269322-539801943592?w=800"
                    alt={item.tour.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.tour.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-black text-blue-600">
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {item.tour.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{item.tour.sub_title}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-black text-blue-600">
                        {Number(item.tour.price).toLocaleString()}d
                      </p>
                      <p className="text-gray-500 text-sm">{item.tour.location_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToBooking(item.tour)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black hover:bg-blue-700 transition-colors"
                      >
                        Dat ngay
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-black hover:bg-gray-200 transition-colors">
                      Xem chi tiet
                    </button>
                    <button className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-black hover:bg-purple-200 transition-colors">
                      Chia se
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-xl font-black text-gray-900 mb-2">Chưa có tour yêu thích</h3>
            <p className="text-gray-600 mb-6">Thêm các tour bạn thích vào danh sách xem sau!</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-colors">
              Khám phá tour
            </button>
          </div>
        )}

        {/* Share Wishlist */}
        {wishlist.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-black text-gray-900 mb-4">Chia sẻ danh sách yêu thích</h3>
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-black hover:bg-blue-100 transition-colors">
                Facebook
              </button>
              <button className="flex-1 bg-green-50 text-green-600 px-4 py-3 rounded-xl font-black hover:bg-green-100 transition-colors">
                Zalo
              </button>
              <button className="flex-1 bg-purple-50 text-purple-600 px-4 py-3 rounded-xl font-black hover:bg-purple-100 transition-colors">
                Email
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
