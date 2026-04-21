"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Send, X, Bot, User } from "lucide-react";
import { sampleTours } from "@/lib/constants";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: "Chào bạn! Bạn cần mình tìm tour nào? ✈️" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Lắng nghe lệnh MỞ chính xác
  useEffect(() => {
    const openMe = () => setIsOpen(true);
    window.addEventListener('openChatbot', openMe);
    return () => window.removeEventListener('openChatbot', openMe);
  }, []);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // CHỐT CHẶN: Ngăn chặn nhấn lần 2
    }
    setIsOpen(false);
    // Phát lệnh HIỆN LẠI cho bộ icon
    window.dispatchEvent(new CustomEvent('closeChatbot'));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    const userMsg = input.toLowerCase();
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const matched = sampleTours.filter(t => t.keywords.some(kw => userMsg.includes(kw)));
      if (matched.length > 0) {
        const reply = (
          <div className="space-y-2">
            <p>Đây có thể là tour bạn cần:</p>
            {matched.map(t => (
              <Link key={t.id} href={`/tour/${t.id}`} className="block p-2 bg-white border border-blue-100 rounded-xl text-blue-600 font-black text-[10px] uppercase">
                {t.name} →
              </Link>
            ))}
          </div>
        );
        setMessages(prev => [...prev, { sender: "bot", text: reply }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "Chỗ này chưa có tour, hãy gõ thử 'Đà Nẵng'!" }]);
      }
    }, 800);
  };

  if (!isOpen) return null; // Sử dụng render điều kiện sạch sẽ

  return (
    <div className="fixed bottom-8 right-8 z-[10000] w-[90vw] md:w-[380px] animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col h-[500px] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <Bot className="text-white" size={18} />
            </div>
            <h3 className="text-white font-black text-sm">VietTravel AI</h3>
          </div>
          {/* NÚT X - NHẤN PHÁT ĂN NGAY NHỜ STOP PROPAGATION */}
          <button 
            onClick={handleClose} 
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3.5 rounded-[20px] text-xs font-bold shadow-sm ${
                msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-5 bg-white border-t border-slate-100">
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-blue-600 transition-all">
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent px-3 py-1.5 font-bold text-slate-700 outline-none text-[13px]"
            />
            <button onClick={handleSend} className="bg-blue-600 text-white p-2.5 rounded-xl active:scale-90 transition-all">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}