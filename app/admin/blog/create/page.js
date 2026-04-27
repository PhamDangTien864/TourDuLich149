'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreatePost() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    image_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi tạo bài viết');
      }

      router.push('/admin/blog');
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
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-pink-600 font-bold mb-4"
        >
          <ArrowLeft size={20} />
          Quay lại
        </Link>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Viết Bài Mới</h1>
        <p className="text-slate-500 font-bold">Tạo bài viết blog mới</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 max-w-4xl">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-pink-600 outline-none transition-all font-bold text-slate-800"
              placeholder="Nhập tiêu đề bài viết"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Danh mục
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-pink-600 outline-none transition-all font-bold text-slate-800"
            >
              <option value="">Chọn danh mục</option>
              <option value="Du lịch">Du lịch</option>
              <option value="Hướng dẫn">Hướng dẫn</option>
              <option value="Tin tức">Tin tức</option>
              <option value="Ẩm thực">Ẩm thực</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              URL ảnh
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-pink-600 outline-none transition-all font-bold text-slate-800"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Tóm tắt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-pink-600 outline-none transition-all font-bold text-slate-800"
              rows={3}
              placeholder="Tóm tắt ngắn về bài viết..."
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Nội dung *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-pink-600 outline-none transition-all font-bold text-slate-800"
              rows={12}
              placeholder="Nội dung chi tiết bài viết..."
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-600"
            />
            <label htmlFor="is_active" className="font-bold text-slate-700">
              Đăng bài ngay
            </label>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Đang lưu...' : 'Lưu bài viết'}
          </button>
          <Link
            href="/admin/blog"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
