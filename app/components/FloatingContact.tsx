/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useRef, useEffect, createContext, useContext, ReactNode } from 'react';
import { Send, X, MessageSquare, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ========================================================
// 1. ĐỊNH NGHĨA CONTEXT QUẢN LÝ TRẠNG THÁI CHAT GLOBAL
// ========================================================
interface Message {
  sender: 'bot' | 'user';
  text: string;
}

interface ChatContextType {
  isOpen: boolean;
  toggleChat: (status?: boolean) => void;
  messages: Message[];
  updateMessages: (newMessages: Message[]) => void;
  clearChat: () => void;
  sessionId: string;
  resetSessionId: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface LocalChatProviderProps {
  children: ReactNode;
}

function LocalChatProvider({ children }: LocalChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Chào bạn! VietTravel có thể giúp gì cho bạn không? ✈️' }
  ]);
  const [sessionId, setSessionId] = useState("");
  const [mounted, setMounted] = useState(false);

  // Khởi tạo dữ liệu từ localStorage khi mount component
  useEffect(() => {
    setMounted(true);

    const savedStatus = localStorage.getItem('chat_status');
    if (savedStatus === 'open') {
      setIsOpen(true);
    }

    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Lỗi parse lịch sử chat:", e);
      }
    }

    // Initialize or retrieve session ID
    let savedSessionId = localStorage.getItem('chat_session_id');
    if (!savedSessionId) {
      savedSessionId = crypto.randomUUID();
      localStorage.setItem('chat_session_id', savedSessionId);
    }
    setSessionId(savedSessionId);
  }, []);

  // Đồng bộ hóa tin nhắn giữa các tab trình duyệt khác nhau
  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat_messages' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
      if (e.key === 'chat_status' && e.newValue) {
        setIsOpen(e.newValue === 'open');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [mounted]);

  const toggleChat = (status?: boolean) => {
    const nextStatus = typeof status === 'boolean' ? status : !isOpen;
    setIsOpen(nextStatus);
    localStorage.setItem('chat_status', nextStatus ? 'open' : 'closed');
  };

  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem('chat_messages', JSON.stringify(newMessages));
  };

  const clearChat = () => {
    const initialMsg: Message[] = [{ sender: 'bot', text: 'Chào bạn! VietTravel có thể giúp gì cho bạn không? ✈️' }];
    setMessages(initialMsg);
    localStorage.setItem('chat_messages', JSON.stringify(initialMsg));
    // Generate new session ID
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
  };

  const resetSessionId = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
  };

  if (!mounted) {
    return (
      <ChatContext.Provider value={{ isOpen: false, toggleChat, messages, updateMessages, clearChat, sessionId: "", resetSessionId }}>
        {children}
      </ChatContext.Provider>
    );
  }

  return (
    <ChatContext.Provider value={{ isOpen, toggleChat, messages, updateMessages, clearChat, sessionId, resetSessionId }}>
      {children}
    </ChatContext.Provider>
  );
}

function useLocalChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat phải được sử dụng bên trong một ChatProvider');
  }
  return context;
}

// ========================================================
// 2. GIAO DIỆN VÀ LOGIC XỬ LÝ CHAT CHÍNH
// ========================================================
function ChatbotInner() {
  const { isOpen, toggleChat, messages, updateMessages, clearChat, sessionId, resetSessionId } = useLocalChat();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasCheckedPrefill = useRef(false);

  // Kiểm tra ngữ cảnh Tour được chuyển sang từ trang chi tiết
  useEffect(() => {
    if (hasCheckedPrefill.current) return;

    const tourContext = localStorage.getItem('tour_context');
    const tourPrefill = localStorage.getItem('tour_prefill');
    
    if (tourContext && tourPrefill) {
      hasCheckedPrefill.current = true;
      
      // Đẩy thông tin ngữ cảnh tour vào dòng thời gian chat
      const contextMessage: Message = { sender: "bot", text: tourContext };
      updateMessages([...messages, contextMessage]);
      
      // Điền sẵn nội dung cần hỏi vào ô input
      setInput(tourPrefill);
      
      // Xóa dấu vết cũ tránh việc reload trang bị lặp lại hành vi
      localStorage.removeItem('tour_context');
      localStorage.removeItem('tour_prefill');
      
      // Tự động mở hộp thoại chat lên
      toggleChat(true);
    }
  }, [messages, updateMessages, toggleChat]);

  // Tự động cuộn mượt xuống tin nhắn mới nhất
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessageText = input.trim();
    const updatedMessages = [...messages, { sender: "user" as const, text: userMessageText }];
    
    updateMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const formattedHistory = updatedMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: typeof msg.text === "string" ? msg.text : "" }]
      }));

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          history: formattedHistory,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.text) {
        updateMessages([...updatedMessages, { sender: "bot" as const, text: data.text }]);
      } else {
        updateMessages([...updatedMessages, { sender: "bot" as const, text: "Dạ, hệ thống đang bận một chút, bạn thử lại sau nhé." }]);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      updateMessages([...updatedMessages, { sender: "bot" as const, text: "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng liên hệ hotline 0862 640 720 để được hỗ trợ!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[99999] flex flex-col items-end gap-4 selection:bg-none">
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
                  <div>
                    <h3 className="font-black text-sm tracking-tight">VietTravel AI</h3>
                    {messages.length > 1 && (
                      <button onClick={() => { if(confirm("Xóa lịch sử chat?")) { clearChat(); resetSessionId(); } }} className="text-[10px] text-white/70 hover:text-white underline block text-left">Xóa lịch sử</button>
                    )}
                  </div>
               </div>
               <button onClick={() => toggleChat(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>

            {/* Nội dung vùng hiển thị Chat */}
            <div ref={scrollRef} className="flex-1 p-5 bg-slate-50/50 overflow-y-auto space-y-4">
               {messages.map((msg, index) => (
                 <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    <div className={`max-w-[85%] p-3.5 rounded-[20px] text-xs font-bold shadow-sm whitespace-pre-line ${
                      msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                    }`}>
                      {msg.sender === 'user' ? (
                        msg.text
                      ) : (
                        // Bộ lọc Parser Markdown tự động biến đổi liên kết thành các nút bấm
                        (() => {
                          const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                          const hasLink = markdownLinkRegex.test(msg.text);
                          if (!hasLink) return msg.text;

                          const parts: React.ReactNode[] = [];
                          let lastIndex = 0;
                          let match;
                          markdownLinkRegex.lastIndex = 0;

                          while ((match = markdownLinkRegex.exec(msg.text)) !== null) {
                            if (match.index > lastIndex) parts.push(msg.text.substring(lastIndex, match.index));
                            
                            const url = match[2];
                            const isInternalLink = url.startsWith('/');

                            parts.push(
                              isInternalLink ? (
                                <Link 
                                  key={match.index} 
                                  href={url} 
                                  className="block my-2 p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all text-center cursor-pointer"
                                >
                                  {match[1]} →
                                </Link>
                              ) : (
                                <a 
                                  key={match.index} 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="block my-2 p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all text-center cursor-pointer"
                                >
                                  {match[1]} →
                                </a>
                              )
                            );
                            lastIndex = markdownLinkRegex.lastIndex;
                          }
                          if (lastIndex < msg.text.length) parts.push(msg.text.substring(lastIndex));
                          return <div className="space-y-1">{parts}</div>;
                        })()
                      )}
                    </div>
                 </div>
               ))}
               {isTyping && <div className="text-[10px] font-black text-slate-400 ml-2 animate-pulse uppercase">AI đang xử lý...</div>}
            </div>

            {/* Khung nhập tin nhắn */}
            <div className="p-4 bg-white border-t border-slate-100">
               <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-blue-600 transition-all">
                  <input 
                    type="text" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..." disabled={isTyping}
                    className="flex-1 bg-transparent px-3 py-1.5 outline-none text-xs font-bold text-slate-700" 
                  />
                  <button onClick={handleSend} disabled={isTyping} className="bg-blue-600 text-white p-2.5 rounded-xl active:scale-90 transition-all disabled:bg-slate-300">
                    <Send size={16} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BỘ NÚT LIÊN HỆ FLOATING (FACEBOOK, ZALO, TOGGLE BUTTON) */}
      <div className="flex flex-col gap-4 items-center">
        {!isOpen && (
          <>
            {/* Nút Facebook */}
            <motion.a initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} href="https://www.facebook.com/phamdangtien888/" target="_blank" className="bg-white p-1 rounded-[22px] shadow-xl hover:-translate-y-1 transition-all">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#1877F2"/><path d="M29.5 24H25.5V36H20.5V24H18.5V20H20.5V17.5C20.5 14.5 22.3 12.5 25.5 12.5C27 12.5 28.5 12.7 28.5 12.7V16.5H26.5C25.1 16.5 24.5 17.3 24.5 18.2V20H29L28.2 24H29.5Z" fill="white"/></svg>
            </motion.a>
            {/* Nút Zalo */}
            <motion.a initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} href="https://zalo.me/0862640720" target="_blank" className="bg-white p-1 rounded-[22px] shadow-xl hover:-translate-y-1 transition-all">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M0 12C0 5.37258 5.37258 0 12 0H36C42.6274 0 48 5.37258 48 12V36C48 42.6274 42.6274 48 36 48H12C5.37258 48 0 42.6274 0 36V12Z" fill="#0068FF"/><path d="M14 34.5V31.5L25.5 21.5H15.5V17.5H33.5V20.5L22 30.5H34.5V34.5H14Z" fill="white"/></svg>
            </motion.a>
          </>
        )}
        {/* Nút bật tắt chính */}
        <button onClick={() => toggleChat(!isOpen)} className={`${isOpen ? 'bg-slate-800' : 'bg-gradient-to-br from-purple-600 to-indigo-700'} text-white w-16 h-16 rounded-[22px] shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300`}>
          {isOpen ? <X size={30} /> : <MessageSquare size={30} fill="white" />}
        </button>
      </div>
    </div>
  );
}

// ========================================================
// 3. EXPORT CHÍNH KHỞI CHẠY COMPONENT
// ========================================================
export default function FloatingContact() {
  return (
    <LocalChatProvider>
      <ChatbotInner />
    </LocalChatProvider>
  );
}