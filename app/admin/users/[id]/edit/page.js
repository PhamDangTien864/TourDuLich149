'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Shield, Phone, Calendar, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function EditUserPage({ params }) {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    birth_date: '',
    role_id: 2,
    is_verified: false
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        setUserId(id);
        
        const res = await fetch(`/admin/users/${id}`);
        if (!res.ok) {
          router.push('/admin/users');
          return;
        }
        const data = await res.json();
        setUser(data);
        setFormData({
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number,
          birth_date: data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : '',
          role_id: data.role_id,
          is_verified: data.is_verified
        });
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [params, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          birth_date: formData.birth_date,
          role_id: formData.role_id,
          is_verified: formData.is_verified
        })
      });

      if (res.ok) {
        setShowModal(false);
        router.push('/admin/users');
      } else {
        alert('Lỗi khi cập nhật user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Lỗi khi cập nhật user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/users"
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black mb-2">Sửa thông tin User</h1>
              <p className="text-blue-100">Chỉnh sửa thông tin cho: {user?.full_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  required
                  readOnly
                />
                <p className="text-xs text-slate-500 mt-1">Username không thay đổi</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Shield size={16} className="inline mr-2" />
                  Vai trò
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({...formData, role_id: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                >
                  <option value={2}>User</option>
                  <option value={1}>Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 mb-2">Trạng thái tài khoản</h3>
                <p className="text-sm text-slate-600">
                  {formData.is_verified ? 
                    <span className="text-green-600">Đã kích hoạt</span> : 
                    <span className="text-red-600">Chưa kích hoạt</span>
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({...formData, is_verified: e.target.checked})}
                    className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-slate-700">Đã kích hoạt</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
            <Link
              href="/admin/users"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <Save size={20} />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Xác nhận thay đổi</h3>
              <p className="text-slate-600 mb-6">
                Bạn có chắc chắn muốn cập nhật thông tin cho user <strong>{user?.full_name}</strong>?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  {saving ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

