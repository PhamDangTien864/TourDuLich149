'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { sampleTours } from "@/lib/constants";

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: "Chào bạn! VietTravel có thể giúp gì cho bạn không? ✈️" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Tự động cuộn tin nhắn
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.toLowerCase();
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const matched = sampleTours.filter(t => t.keywords.some(kw => userMsg.includes(kw)));
      if (matched.length > 0) {
        const reply = (
          <div className="space-y-2">
            <p className="font-bold text-slate-700">Đây có thể là tour bạn cần:</p>
            {matched.map(t => (
              <Link key={t.id} href={`/tour/${t.id}`} className="block p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">
                {t.name} →
              </Link>
            ))}
          </div>
        );
        setMessages(prev => [...prev, { sender: "bot", text: reply }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "Chưa có tour, hãy gõ thử 'Đà Nẵng'!" }]);
      }
    }, 800);
  };

  const handleCloseChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Close button clicked - FORCE CLOSE'); // Debug log
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[99999] flex flex-col items-end gap-4 selection:bg-none">
      
      {/* KHUNG CHATBOT AI */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="mb-4 w-[90vw] md:w-[380px] h-[500px] bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Header Chatbot */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex justify-between items-center text-white">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md"><Bot size={20} /></div>
                  <h3 className="font-black text-sm tracking-tight">VietTravel AI</h3>
               </div>
               {/* NÚT X - DÙNG HANDLER FUNCTION RIÊNG */}
               <button 
                onClick={handleCloseChat}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
               >
                <X size={20} />
               </button>
            </div>

            {/* Nội dung Chat */}
            <div ref={scrollRef} className="flex-1 p-5 bg-slate-50/50 overflow-y-auto space-y-4">
               {messages.map((msg, index) => (
                 <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    <div className={`max-w-[85%] p-3.5 rounded-[20px] text-xs font-bold shadow-sm ${
                      msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                    }`}>
                      {msg.text}
                    </div>
                 </div>
               ))}
               {isTyping && <div className="text-[10px] font-black text-slate-400 ml-2 animate-pulse uppercase tracking-widest">Bot đang gõ...</div>}
            </div>

            {/* Input Chat */}
            <div className="p-4 bg-white border-t border-slate-100">
               <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-blue-600 transition-all">
                  <input 
                    type="text" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..." 
                    className="flex-1 bg-transparent px-3 py-1.5 outline-none text-xs font-bold text-slate-700" 
                  />
                  <button onClick={handleSend} className="bg-blue-600 text-white p-2.5 rounded-xl active:scale-90 transition-all">
                    <Send size={16} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BỘ 3 NÚT FLOATING */}
      <div className="flex flex-col gap-4 items-center">
        {!isOpen && (
          <>
            {/* Nút Facebook */}
            <motion.a 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              href="https://facebook.com/penixillin" target="_blank" 
              className="bg-white p-1 rounded-[22px] shadow-xl hover:-translate-y-1 transition-all"
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#1877F2"/>
                <path d="M29.5 24H25.5V36H20.5V24H18.5V20H20.5V17.5C20.5 14.5 22.3 12.5 25.5 12.5C27 12.5 28.5 12.7 28.5 12.7V16.5H26.5C25.1 16.5 24.5 17.3 24.5 18.2V20H29L28.2 24H29.5Z" fill="white"/>
              </svg>
            </motion.a>

            {/* Nút Zalo - CHUẨN ICON CH PLAY (Ảnh bạn gửi) */}
            <motion.a 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              href="https://zalo.me/0862640720" target="_blank" 
              className="bg-white p-1 rounded-[22px] shadow-xl hover:-translate-y-1 transition-all"
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M0 12C0 5.37258 5.37258 0 12 0H36C42.6274 0 48 5.37258 48 12V36C48 42.6274 42.6274 48 36 48H12C5.37258 48 0 42.6274 0 36V12Z" fill="#0068FF"/>
                <path d="M14 34.5V31.5L25.5 21.5H15.5V17.5H33.5V20.5L22 30.5H34.5V34.5H14Z" fill="white"/>
              </svg>
            </motion.a>
          </>
        )}

        {/* Nút Toggle Chatbot - Nút này giờ CHỈ LÀM 1 VIỆC LÀ ĐẢO TRẠNG THÁI */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`${isOpen ? 'bg-slate-800' : 'bg-gradient-to-br from-purple-600 to-indigo-700'} text-white w-16 h-16 rounded-[22px] shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300`}
        >
          {isOpen ? <X size={30} /> : <MessageSquare size={30} fill="white" />}
        </button>
      </div>
    </div>
  );
}