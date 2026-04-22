'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

export default function TourActions({ tour }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tours/${tour.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Xóa tour thành công!');
        setShowDeleteModal(false);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Xóa tour thất bại!');
      }
    } catch (error) {
      console.error('Delete tour error:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link 
          href={`/tour/${tour.id}`}
          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
          title="Xem tour"
        >
          <Eye size={16} />
        </Link>
        <Link 
          href={`/admin/tours/${tour.id}/edit`}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-2 rounded-lg transition-colors"
          title="Sửa tour"
        >
          <Edit size={16} />
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
          title="Xóa tour"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa tour"
        message="Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn tác."
        itemName={tour.title}
      />
    </>
  );
}
