'use client';

import { Edit, Trash2, UserCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UserActions({ user }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Ban co chac chan muon xoa user "${user.full_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Xóa user thành công!');
        router.refresh(); // Refresh page to update data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Xóa user that bai!');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Có loi xay ra, vui long thu lai!');
    }
  };

  const handleToggleRole = async () => {
    try {
      const response = await fetch(`/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Thay doi vai trò thành công!');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Thay doi vai trò that bai!');
      }
    } catch (error) {
      console.error('Toggle role error:', error);
      toast.error('Có loi xay ra, vui long thu lai!');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleRole}
        className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
        title="Thay doi vai trò"
      >
        <UserCheck size={16} />
      </button>
      <Link 
        href={`/admin/users/${user.id}/edit`}
        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-2 rounded-lg transition-colors"
        title="Sua user"
      >
        <Edit size={16} />
      </Link>
      <button
        onClick={handleDelete}
        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
        title="Xoa user"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
