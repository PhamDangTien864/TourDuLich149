'use client';

import { useState } from 'react';
import { Edit, Trash2, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UserActions({ user }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Xóa user thành công!');
        setShowDeleteModal(false);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Xóa user thất bại!');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRole = async () => {
    try {
      const response = await fetch(`/admin/users/${user.id}/toggle-role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Thay đổi vai trò thành công!');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Thay đổi vai trò thất bại!');
      }
    } catch (error) {
      console.error('Toggle role error:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleRole}
          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
          title="Thay đổi vai trò"
        >
          <UserCheck size={16} />
        </button>
        <Link 
          href={`/admin/users/${user.id}/edit`}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-2 rounded-lg transition-colors"
          title="Sửa user"
        >
          <Edit size={16} />
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
          title="Xóa user"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Xác nhận xóa</h3>
              <p className="text-slate-600 mb-6">
                Bạn có chắc chắn muốn xóa user <strong>{user.full_name}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa user'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
