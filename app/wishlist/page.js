'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Trash2, Search, MapPin, ArrowLeft, Home, User, History } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function WishlistPage() {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchWishlist = async (userId) => {
    try {
      const response = await fetch(`/api/wishlist?user_id=${userId}`);
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsedUser);

      // Block admin from accessing customer pages
      if (parsedUser.role_id === 1) {
        router.push('/admin');
        return;
      }

      fetchWishlist(parsedUser.id);
    } else {
      router.push('/login');
      return;
    }
  }, [router]);

  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      const response = await fetch(`/api/wishlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wishlist_id: wishlistId }),
      });

      if (response.ok) {
        // Refresh wishlist
        fetchWishlist(user.id);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    router.push('/login');
  };

  const filteredWishlist = wishlist.filter(item => 
    (item.tour?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.tour?.location_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-800 mb-8">Tour yêu thích</h1>

          {/* Thanh Menu Điều Hướng (Dashboard) */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <Home size={18} /> Trang chủ
            </Link>
            <Link href="/customer/profile" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <User size={18} /> Hồ sơ cá nhân
            </Link>
            <Link href="/customer/bookings" className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200">
              <History size={18} /> Lịch sử đặt tour
            </Link>
            <button className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Heart size={18} /> Tour yêu thích
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm tour trong danh sách yêu thích..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Wishlist Items */}
          {filteredWishlist.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {searchTerm ? 'Không tìm tour nào' : 'Chưa có tour yêu thích'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm 
                  ? 'Không tìm tour nào phù hợp với tìm kiếm của bạn.' 
                  : 'Thêm tour yêu thích vào danh sách để dễ dàng theo dõi!'}
              </p>
              <Link href="/search" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold">
                {searchTerm ? 'Xem tất cả' : 'Tìm tour'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWishlist.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-slate-100">
                  {/* Tour Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold mb-2">{item.tour.title}</div>
                        <div className="text-sm opacity-90">{item.tour.location_name}</div>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>

                  {/* Tour Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{item.tour.title}</h3>
                    
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                      <MapPin size={16} />
                      <span>{item.tour.location_name}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        ${Number(item.tour.price).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {item.tour.max_slots} slot
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link 
                        href={`/tour/${item.tour.id}`}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold text-center"
                      >
                        Chi tiết
                      </Link>
                      <Link 
                        href={`/booking?tourId=${item.tour.id}&price=${item.tour.price}&title=${encodeURIComponent(item.tour.title)}`}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold text-center"
                      >
                        Đặt tour
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
