"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SearchFilter({ onFilter }) {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    priceRange: [0, 10000000],
    location: "",
    rating: 0
  });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - will be replaced with API calls
  useEffect(() => {
    setCategories([
      { id: 1, name: "Bien" },
      { id: 2, name: "Nui" },
      { id: 3, name: "Thanh pho" }
    ]);
    
    setLocations([
      "Da Nang",
      "Phu Quoc", 
      "Ha Noi",
      "Sapa",
      "Da Lat",
      "Nha Trang"
    ]);
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handlePriceChange = (type, value) => {
    const newPriceRange = [...filters.priceRange];
    if (type === "min") {
      newPriceRange[0] = parseInt(value) || 0;
    } else {
      newPriceRange[1] = parseInt(value) || 10000000;
    }
    handleFilterChange("priceRange", newPriceRange);
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: "",
      category: "",
      priceRange: [0, 10000000],
      location: "",
      rating: 0
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tim kiem tour..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl font-black hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {showFilters ? "An bo loc" : "Hien bo loc"}
      </button>

      {/* Filters Panel */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showFilters ? "auto" : 0, 
          opacity: showFilters ? 1 : 0 
        }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Loại hình tour
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleFilterChange("category", "")}
                className={`px-3 py-2 rounded-xl text-sm font-black transition-colors ${
                  filters.category === ""
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange("category", cat.id.toString())}
                  className={`px-3 py-2 rounded-xl text-sm font-black transition-colors ${
                    filters.category === cat.id.toString()
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Địa điểm
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả địa điểm</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Khoảng giá
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Gia thap nhat"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange("min", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Gia cao nhat"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange("max", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{filters.priceRange[0].toLocaleString()}d</span>
                <span>{filters.priceRange[1].toLocaleString()}d</span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Xếp hạng tối thiểu
            </label>
            <div className="flex gap-2">
              {[0, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange("rating", rating)}
                  className={`px-3 py-2 rounded-xl text-sm font-black transition-colors ${
                    filters.rating === rating
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {rating === 0 ? "Tat ca" : `${rating}+ sao`}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-xl font-black hover:bg-red-100 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </motion.div>
    </div>
  );
}
