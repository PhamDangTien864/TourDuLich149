'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { ArrowLeft, Save, MapPin, DollarSign, FileText, ImagePlus } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

export default function CreateTourPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    location_name: '',
    price: '',
    category_id: 1,
    description: '',
    sub_title: '',
    max_slots: 20,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          max_slots: parseInt(formData.max_slots)
        })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/tours');
      } else {
        setError(data.error || 'Lỗi khi tạo tour');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, sub_title: imageUrl });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/tours')}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Tạo Tour Mới</h1>
          <p className="text-slate-500">Thêm tour mới vào hệ thống</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  <FileText size={16} />
                  Tên tour
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  <MapPin size={16} />
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  <DollarSign size={16} />
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  required
                  min={0}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  <FileText size={16} />
                  Số chỗ tối đa
                </label>
                <input
                  type="number"
                  value={formData.max_slots}
                  onChange={(e) => setFormData({ ...formData, max_slots: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  required
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                <FileText size={16} />
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800 min-h-[150px]"
                required
              />
            </div>

            <ImageUpload onUploadSuccess={handleImageUpload} />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="is_active" className="font-bold text-slate-700">
                Tour đang hoạt động
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/tours')}
                className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {loading ? 'Đang lưu...' : 'Lưu tour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
