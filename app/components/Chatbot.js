"use client";

import { useState } from "react";
import Link from "next/link";

// Giữ nguyên data mẫu của ní
const toursData = [
  { id: 1, name: "Tour Đà Nẵng", keywords: ["biển", "miền trung", "da nang"] },
  { id: 2, name: "Tour Phú Quốc", keywords: ["biển", "đảo", "phu quoc"] },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi là trợ lý VietTravel. Bạn muốn đi du lịch ở đâu?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. Thêm tin nhắn của user
    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    // 2. Logic xử lý của Bot (Giữ nguyên logic cũ của ní)
    setTimeout(() => {
      const lowerMsg = userMsg.toLowerCase();
      const matchedTours = toursData.filter((tour) =>
        tour.keywords.some((kw) => lowerMsg.includes(kw))
      );

      if (matchedTours.length > 0) {
        const reply = (
          <div className="space-y-2">
            <p>Tôi tìm thấy vài tour hợp với ní nè:</p>
            {matchedTours.map((t) => (
              <div key={t.id} className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                <span className="font-bold text-blue-800">{t.name}</span>
                <Link 
                  href={`/tour/${t.id}`} 
                  className="block text-xs text-blue-600 underline font-black uppercase mt-1"
                >
                  Xem chi tiết →
                </Link>
              </div>
            ))}
          </div>
        );
        setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Rất tiếc, tôi chưa tìm thấy tour phù hợp. Ní thử gõ 'Đà Nẵng' hoặc 'Phú Quốc' xem sao?" },
        ]);
      }
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-[9999]">
      
      {/* Nút Zalo (Luôn hiện) */}
      <a 
        href="https://zalo.me/0862640720" 
        target="_blank" 
        className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all border border-blue-100 group"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" className="w-8 h-8 group-hover:rotate-12 transition-transform" />
      </a>

      {/* Khung Chatbot */}
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white rounded-[30px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-2 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center shadow-lg">
            <div>
              <h3 className="font-black text-lg tracking-tighter">VietTravel AI</h3>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-blue-100">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Đang trực tuyến
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 flex flex-col">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[85%] p-3 text-sm shadow-sm ${
                  msg.sender === "user" 
                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-none self-end" 
                  : "bg-white text-slate-700 rounded-2xl rounded-tl-none self-start border border-slate-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hỏi tôi về các tour..." 
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
            <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 shadow-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.941 23.172 23.172 0 0 0 20.151-11.673.75.75 0 0 0 0-.718A23.172 23.172 0 0 0 3.478 2.404Z" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Nút Toggle Chat */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? 'bg-slate-900 rotate-90 scale-90' : 'bg-blue-600 hover:scale-110 active:scale-95'}`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
        )}
      </button>
    </div>
  );
}