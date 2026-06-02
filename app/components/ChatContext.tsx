/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Message {
  sender: string;
  text: string;
}

interface ChatContextType {
  isOpen: boolean;
  toggleChat: (openState: boolean) => void;
  messages: Message[];
  updateMessages: (newMessages: Message[]) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Lazy initialization - read from localStorage on mount
    if (typeof window === 'undefined') return [];
    const savedMessages = localStorage.getItem('viet_chat_history');
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    // Default welcome message
    return [{ sender: "bot", text: "Chào bạn! VietTravel có thể giúp gì cho bạn không? ✈️" }];
  });
  const [isMounted, setIsMounted] = useState(false);

  // 1. Chỉ chạy dưới Client sau khi trang đã mount thành công
  useEffect(() => {
    setIsMounted(true);

    // Đọc trạng thái đóng/mở
    const savedOpenState = localStorage.getItem('viet_chat_open');
    if (savedOpenState) {
      setIsOpen(savedOpenState === 'true');
    }
  }, []);

  // 2. LẮNG NGHE SỰ KIỆN THAY ĐỔI TỪ TAB KHÁC
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'viet_chat_history' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
      if (e.key === 'viet_chat_open' && e.newValue) {
        setIsOpen(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 3. Hàm cập nhật trạng thái đóng/mở
  const toggleChat = (openState: boolean) => {
    setIsOpen(openState);
    localStorage.setItem('viet_chat_open', openState.toString());
  };

  // 4. Hàm cập nhật tin nhắn
  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem('viet_chat_history', JSON.stringify(newMessages));
  };

  const clearChat = () => {
    localStorage.removeItem('viet_chat_history');
    localStorage.removeItem('viet_chat_open');
    setMessages([{ sender: "bot", text: "Chào bạn! VietTravel có thể giúp gì cho bạn không? ✈️" }]);
    setIsOpen(false);
  };

  // Nếu phía client chưa sẵn sàng, trả về giao diện rỗng tạm thời để tránh lỗi đồng bộ Next.js
  if (!isMounted) return <>{children}</>;

  return (
    <ChatContext.Provider value={{ isOpen, toggleChat, messages, updateMessages, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat phải được sử dụng bên trong một ChatProvider");
  }
  return context;
};
