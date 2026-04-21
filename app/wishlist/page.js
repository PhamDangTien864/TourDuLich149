'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Trash2, Search, Calendar, MapPin, Star, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Kiêm tra role - chi cho customer (role = 2)
      if (parsedUser.role !== 2) {
        router.push('/');
        return;
      }
      
      // Lây wishlist
      setTimeout(function() { fetchWishlist(parsedUser.id) }, 0);
    } else {
      router.push('/login');
    }
  }, [router]);

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
    item.tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tour.location_name.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-lg font-bold text-gray-800">Viet<span className="text-blue-600">Travel</span></span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/customer/profile" className="flex items-center gap-2 text-blue-600 font-semibold">
                <span className="text-pink-500">§</span>
                Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
                <ArrowLeft size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Heart size={32} className="text-pink-500" />
              Yêu thích
            </h1>
            <div className="text-sm text-gray-500">
              {wishlist.length} tour(s) trong danh sách yêu thích
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-wrap gap-2">
              <Link href="/customer/profile" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">
                Thông tin cá nhân
              </Link>
              <Link href="/history" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">
                Lich su dat tour
              </Link>
              <Link href="/wishlist" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
                Yêu thích
              </Link>
              <Link href="/search" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">
                Tim tour
              </Link>
              <Link href="/" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">
                Trang chu
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm tour trong danh sách yêu thích..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Wishlist Items */}
        {filteredWishlist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {searchTerm ? 'Không tìm tour nào' : 'Chua co tour yeu thich'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Không tìm tour nào phù hoi voi tìm kiêm cua ban.' 
                : 'Thêm tour yêu thích vào danh sách de dàng dàng theo dõi!'}
            </p>
            <Link href="/search" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold">
              {searchTerm ? 'Xem tat ca' : 'Tim tour'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
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
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.tour.title}</h3>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <MapPin size={16} />
                    <span>{item.tour.location_name}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-blue-600">
                      ${Number(item.tour.price).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.tour.max_slots} slot
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/tour/${item.tour.id}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold text-center"
                    >
                      Chi tiet
                    </Link>
                    <Link 
                      href={`/booking?tourId=${item.tour.id}&price=${item.tour.price}&title=${encodeURIComponent(item.tour.title)}`}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold text-center"
                    >
                      Dat tour
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
