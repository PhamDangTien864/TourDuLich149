'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Calendar, Users } from 'lucide-react';

export default function SearchForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    q: '',
    date: '',
    passengers: '1'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (formData.q) params.append('q', formData.q);
    if (formData.date) params.append('date', formData.date);
    if (formData.passengers) params.append('passengers', formData.passengers);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Điểm đến</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              name="q"
              value={formData.q}
              onChange={(e) => setFormData({ ...formData, q: e.target.value })}
              placeholder="Đà Nẵng, Nha Trang..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all min-h-[56px]"
              required
            />
          </div>
        </div>
        
        <div className="relative">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Ngày đi</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all min-h-[56px]"
            />
          </div>
        </div>
        
        <div className="relative">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Hành khách</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              name="passengers"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer min-h-[56px]"
            >
              <option value="1">1 người</option>
              <option value="2">2 người</option>
              <option value="3">3 người</option>
              <option value="4">4 người</option>
              <option value="5">5+ người</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="md:col-span-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 min-h-[56px]">
          <Search size={20} />
          Tìm kiếm tour ngay
        </button>
      </form>
    </div>
  );
}
