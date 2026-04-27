"use client";

import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ReviewSystem = memo(function ReviewSystem({ tourId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Load reviews from API
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews?tour_id=${tourId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.totalReviews || 0);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Fallback to mock data
        const mockReviews = [
          {
            id: 1,
            rating: 5,
            comment: "Tour tuyệt vời! Hướng dẫn viên rất hay, khách sạn sạch sẽ.",
            account: { full_name: "Nguyen Van A" },
            created_at: new Date("2024-01-15")
          },
          {
            id: 2,
            rating: 4,
            comment: "Tốt nhưng thời gian còn ngắn, cần thêm thời gian tự do.",
            account: { full_name: "Tran Thi B" },
            created_at: new Date("2024-01-10")
          }
        ];
        setReviews(mockReviews);
        const avg = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
        setTotalReviews(mockReviews.length);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [tourId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_id: tourId,
          rating: formData.rating,
          comment: formData.comment
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh reviews
        const reviewsRes = await fetch(`/api/reviews?tour_id=${tourId}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
          setAverageRating(reviewsData.averageRating || 0);
          setTotalReviews(reviewsData.totalReviews || 0);
        }

        setFormData({ rating: 5, comment: "" });
        setShowForm(false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Lỗi khi gửi đánh giá');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Lỗi khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={() => interactive && setFormData({ ...formData, rating: star })}
            className={`text-2xl transition-colors ${
              interactive ? "hover:scale-110 cursor-pointer" : "cursor-default"
            } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            disabled={!interactive}
          >
            {star <= rating ? "filled" : "outlined"}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-blue-900">Đánh giá</h3>
            <div className="flex items-center gap-4 mt-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-3xl font-black text-blue-600">{averageRating}</span>
              <span className="text-blue-700 font-bold">({totalReviews} đánh giá)</span>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-colors"
          >
            Viết đánh giá
          </button>
        </div>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h4 className="text-xl font-black mb-4">Viết đánh giá của bạn</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Xếp hạng
                </label>
                {renderStars(formData.rating, true)}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bình luận
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-black hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-black text-gray-900">{review.account.full_name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            {review.admin_reply && (
              <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Phản hồi từ Admin</span>
                </div>
                <p className="text-blue-800 text-sm leading-relaxed">{review.admin_reply}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 font-bold">Chưa có đánh giá nào.</p>
          <p className="text-gray-400 text-sm mt-2">Hãy là người đầu tiên đánh giá tour này!</p>
        </div>
      )}
    </div>
  );
});

export default ReviewSystem;
