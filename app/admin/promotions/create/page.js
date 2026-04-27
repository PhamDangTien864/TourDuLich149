'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreatePromotion() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_amount: '0',
    start_date: '',
    end_date: '',
    description: '',
    category_name: '',
    is_active: true
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/tour-categories');
        const data = await res.json();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discount_value: BigInt(formData.discount_value),
          min_amount: BigInt(formData.min_amount)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi tạo mã khuyến mãi');
      }

      router.push('/admin/promotions');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link
          href="/admin/promotions"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-600 font-bold mb-4"
        >
          <ArrowLeft size={20} />
          Quay lại
        </Link>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Tạo Mã Khuyến Mãi Mới</h1>
        <p className="text-slate-500 font-bold">Tạo mã giảm giá mới cho khách hàng</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Mã khuyến mãi *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
              placeholder="VD: SUMMER2024"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Loại giảm giá *
            </label>
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
              required
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (VNĐ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Giá trị giảm giá *
            </label>
            <input
              type="number"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
              placeholder={formData.discount_type === 'percentage' ? 'VD: 20' : 'VD: 500000'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Giá trị đơn hàng tối thiểu
            </label>
            <input
              type="number"
              value={formData.min_amount}
              onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
              placeholder="VD: 1000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Ngày bắt đầu *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Ngày kết thúc *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Loại tour áp dụng
            </label>
            <select
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
            >
              <option value="">Tất cả loại tour</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Để trống để áp dụng cho tất cả các tour</p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-600 outline-none transition-all font-bold text-slate-800"
              rows={3}
              placeholder="Mô tả về mã khuyến mãi..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-600"
            />
            <label htmlFor="is_active" className="font-bold text-slate-700">
              Kích hoạt ngay
            </label>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Đang lưu...' : 'Lưu mã khuyến mãi'}
          </button>
          <Link
            href="/admin/promotions"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
