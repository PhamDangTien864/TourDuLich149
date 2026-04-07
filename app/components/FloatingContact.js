'use client';
import { useState } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const zaloNumber = "0862640720"; // Thay số ní vào đây

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[350px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><MessageCircle size={24} /></div>
                  <h3 className="font-black">VietTravel AI</h3>
               </div>
               <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
            </div>
            <div className="h-80 p-6 bg-slate-50 overflow-y-auto">
               <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-sm font-bold text-slate-600">Ní cần VietTravel tư vấn tour nào ạ? 👋</div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
               <input type="text" placeholder="Nhập câu hỏi..." className="flex-1 bg-slate-50 rounded-xl px-4 py-2 outline-none text-sm font-bold" />
               <button className="bg-blue-600 text-white p-2 rounded-xl"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {/* Nút Zalo */}
        <a href={`https://zalo.me/${zaloNumber}`} target="_blank" className="bg-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform border border-blue-50">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" className="w-8 h-8" alt="Zalo" />
        </a>
        {/* Nút Chatbot */}
        <button onClick={() => setIsOpen(!isOpen)} className={`${isOpen ? 'bg-slate-800' : 'bg-blue-600'} text-white w-16 h-16 rounded-[22px] shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300`}>
          {isOpen ? <X size={30} /> : <MessageCircle size={30} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}