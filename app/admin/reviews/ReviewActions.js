'use client';

import { Eye, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReviewActions({ reviewId, tourId, adminReply }) {
  const router = useRouter();

  const handleReply = async () => {
    // TODO: Replace window.prompt() with a proper modal/dialog component for better UX
    // window.prompt() is not suitable for production systems
    const reply = prompt('Nhập phản hồi admin:', adminReply || '');
    if (reply !== null) {
      await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_reply: reply })
      });
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (confirm('Xóa đánh giá này?')) {
      try {
        await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
        router.refresh();
      } catch {
        alert('Lỗi xóa đánh giá');
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/tour/${tourId}`} className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors" title="Xem tour">
        <Eye size={16} />
      </Link>
      <button onClick={handleReply} className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-2 rounded-lg transition-colors" title="Phản hồi">
        <MessageSquare size={16} />
      </button>
      <button onClick={handleDelete} className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors" title="Xóa">
        <Trash2 size={16} />
      </button>
    </div>
  );
}