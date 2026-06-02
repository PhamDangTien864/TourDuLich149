'use client';

import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';

export default function AskAITourButton({ tour }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAskAI = () => {
    // Dispatch event to open chatbot with tour context
    const tourContext = `
Thông tin tour:
- Tên: ${tour.title}
- Điểm đến: ${tour.location_name}
- Thời lượng: ${tour.duration_days} ngày
- Giá: ${Number(tour.price).toLocaleString()}đ
- Mô tả: ${tour.description?.substring(0, 200)}...
- Điểm nổi bật: ${tour.highlights || 'Chưa có thông tin'}
- Video: ${tour.video_url || 'Chưa có video'}
- Mẹo chuẩn bị: ${tour.tips || 'Chưa có thông tin'}
`;

    // Pre-fill chatbot with a question about this tour
    localStorage.setItem('tour_prefill', `Cho tôi hỏi về tour "${tour.title}" này...`);
    
    // Store tour context in localStorage for chatbot to use
    localStorage.setItem('tour_context', tourContext);
    
    // Open chatbot after data is set
    window.dispatchEvent(new CustomEvent('openChatbot'));
  };

  return (
    <button
      onClick={handleAskAI}
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
    >
      <Bot size={20} />
      <span>Hỏi AI về tour này</span>
      <Sparkles size={16} className="animate-pulse" />
    </button>
  );
}
