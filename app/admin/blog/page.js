'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, FileText } from "lucide-react";
import Link from "next/link";

export default function ManageBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data || []);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">📝 Quản lý Blog</h1>
              <p className="text-pink-100">Quản lý bài viết và tin tức</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/blog/create"
                className="bg-white text-pink-600 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Viết bài mới
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-pink-500 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:border-pink-500 outline-none transition-all">
                <option value="">Tất cả danh mục</option>
                <option value="Du lịch">Du lịch</option>
                <option value="Hướng dẫn">Hướng dẫn</option>
                <option value="Tin tức">Tin tức</option>
              </select>
              <button className="bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 transition-colors flex items-center gap-2">
                <Filter size={18} />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Tiêu đề</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Danh mục</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Ngày tạo</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-bold">Đang tải...</td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-bold">Chưa có bài viết nào</td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <FileText className="text-pink-600" size={20} />
                          </div>
                          <p className="font-bold text-slate-800">{post.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-bold">{post.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          post.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.is_active ? 'Đã đăng' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600 font-bold">{new Date(post.created_at).toLocaleDateString('vi-VN')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
