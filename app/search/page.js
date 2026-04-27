'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, MapPin, ArrowRight, SlidersHorizontal, DollarSign, Calendar, Star, X, Loader2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const query = searchParams.get('q') || "";
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 100000000;
  const category = searchParams.get('category') ? Number(searchParams.get('category')) : null;
  const sortBy = searchParams.get('sortBy') || "newest";
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : 0;

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (minPrice > 0) params.append('minPrice', minPrice.toString());
        if (maxPrice < 100000000) params.append('maxPrice', maxPrice.toString());
        if (category) params.append('category', category.toString());
        if (sortBy) params.append('sortBy', sortBy);
        params.append('page', page.toString());
        params.append('limit', '10'); // 10 tours per page

        console.log('Search params:', params.toString());
        const res = await fetch(`/api/tours?${params.toString()}`);
        const data = await res.json();
        setSearchResults(data.tours || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalTours(data.pagination?.total || 0);
        setCurrentPage(page);
        console.log('Fetched tours:', data.tours?.length || 0, 'Total:', data.pagination?.total);
      } catch (error) {
        console.error('Error fetching tours:', error);
        setSearchResults([]);
        setTotalPages(1);
        setTotalTours(0);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/tour-categories');
        const data = await res.json();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchTours();
    fetchCategories();
  }, [query, minPrice, maxPrice, category, sortBy, page, minRating]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = new URLSearchParams();

    if (formData.get('q')) params.append('q', formData.get('q'));
    if (formData.get('category')) params.append('category', formData.get('category'));
    if (formData.get('sortBy')) params.append('sortBy', formData.get('sortBy'));
    if (formData.get('minPrice')) params.append('minPrice', formData.get('minPrice'));
    if (formData.get('maxPrice')) params.append('maxPrice', formData.get('maxPrice'));
    if (formData.get('minRating')) params.append('minRating', formData.get('minRating'));
    if (formData.get('minDuration')) params.append('minDuration', formData.get('minDuration'));
    if (formData.get('maxDuration')) params.append('maxDuration', formData.get('maxDuration'));
    if (formData.get('availability')) params.append('availability', formData.get('availability'));
    params.append('page', '1'); // Reset to page 1 when filtering

    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (minPrice > 0) params.append('minPrice', minPrice.toString());
    if (maxPrice < 100000000) params.append('maxPrice', maxPrice.toString());
    if (category) params.append('category', category.toString());
    if (sortBy) params.append('sortBy', sortBy);
    params.append('page', newPage.toString());

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white mb-1">
                  {query ? `Kết quả cho "${query}"` : 'Tất cả tour'}
                </h1>
                <p className="text-blue-100 font-bold text-sm">
                  Tìm thấy <span className="text-white text-lg font-black mx-1">{totalTours}</span> tour phù hợp
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Search size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={handleFilterSubmit} className="bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-2xl p-5 shadow-xl border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <SlidersHorizontal size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Bộ lọc</h2>
                <p className="text-xs font-bold text-slate-400">Tìm tour theo nhu cầu của bạn</p>
              </div>
            </div>
            {(query || minPrice > 0 || maxPrice < 100000000 || category || minRating > 0) && (
              <button
                type="button"
                onClick={() => router.push('/search')}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm transition"
              >
                <X size={16} />
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              name="q"
              placeholder=" Tìm địa điểm..."
              defaultValue={query || ""}
              className="w-52 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />

            <select
              name="category"
              defaultValue={category || ""}
              className="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm cursor-pointer"
            >
              <option value=""> Danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>

            <select
              name="sortBy"
              defaultValue={sortBy}
              className="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm cursor-pointer"
            >
              <option value="newest"> Mới nhất</option>
              <option value="price_asc"> Giá thấp</option>
              <option value="price_desc"> Giá cao</option>
            </select>

            <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
              <DollarSign size={16} className="text-slate-400" />
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                defaultValue={minPrice || ""}
                className="w-24 px-2 py-1.5 bg-transparent font-bold text-sm text-slate-700 focus:outline-none"
              />
              <span className="text-slate-400 font-bold text-sm">-</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                defaultValue={maxPrice === 100000000 ? "" : maxPrice}
                className="w-24 px-2 py-1.5 bg-transparent font-bold text-sm text-slate-700 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-700 transition-all"
            >
              <Calendar size={16} />
              Nâng cao
            </button>

            <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
               Tìm kiếm
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rating Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block">Đánh giá tối thiểu</label>
                <select
                  name="minRating"
                  defaultValue={minRating || ""}
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:border-yellow-500 transition-all cursor-pointer"
                >
                  <option value=""> Tất cả</option>
                  <option value="4"> 4+ sao</option>
                  <option value="3"> 3+ sao</option>
                  <option value="2"> 2+ sao</option>
                  <option value="1"> 1+ sao</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block">Thời lượng (ngày)</label>
                <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-3 py-1.5">
                  <input
                    type="number"
                    name="minDuration"
                    placeholder="Min"
                    defaultValue=""
                    className="w-20 px-2 py-1.5 bg-transparent font-bold text-sm text-slate-700 focus:outline-none"
                  />
                  <span className="text-slate-400 font-bold text-sm">-</span>
                  <input
                    type="number"
                    name="maxDuration"
                    placeholder="Max"
                    defaultValue=""
                    className="w-20 px-2 py-1.5 bg-transparent font-bold text-sm text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block">Tình trạng</label>
                <select
                  name="availability"
                  defaultValue=""
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:border-green-500 transition-all cursor-pointer"
                >
                  <option value=""> Tất cả</option>
                  <option value="available"> Còn chỗ</option>
                  <option value="limited"> Sắp hết chỗ</option>
                </select>
              </div>
            </div>
          )}
        </form>

        {searchResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {searchResults.map(tour => (
                <Link href={`/tour/${tour.id}`} key={tour.id} className="group bg-white rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100">
                  <div className="h-48 bg-slate-100 rounded-2xl mb-6 overflow-hidden">
                    <img
                      src={tour.tour_images?.[0]?.image_url || "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=400"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={tour.title}
                    />
                  </div>
                  <h3 className="text-xl font-black mb-2 text-slate-800 line-clamp-1">{tour.title}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-sm font-bold mb-4">
                    <MapPin size={14} /> {tour.location_name}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                     <p className="text-xl font-black text-blue-600">{Number(tour.price).toLocaleString()}đ</p>
                     <ArrowRight className="text-blue-600" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all flex items-center justify-center ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  ›
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <Search className="mx-auto text-slate-200 mb-6" size={64} />
            <h2 className="text-2xl font-black text-slate-400">Không tìm thấy tour nào!</h2>
            <Link href="/" className="text-blue-600 font-black mt-4 block hover:underline">Quay lại trang chủ</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-28">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}