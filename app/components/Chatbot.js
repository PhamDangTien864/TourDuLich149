"use client";
import { useState } from "react";
import Link from "next/link";

const tours = [
  { id: 1, name: "Tour Đà Nẵng", keywords: ["biển", "miền trung", "da nang"] },
  { id: 2, name: "Tour Phú Quốc", keywords: ["biển", "đảo", "phu quoc"] },
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể tư vấn tour cho bạn. Bạn muốn đi đâu?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const userMsg = input.toLowerCase();
    setInput("");

    // Bot trả lời sau 0.5s
    setTimeout(() => {
      // Tìm tour dựa trên từ khóa
      const matchedTours = tours.filter((tour) =>
        tour.keywords.some((kw) => userMsg.includes(kw))
      );

      if (matchedTours.length > 0) {
        const reply = matchedTours.map((t) => (
          <div key={t.id} style={{ marginTop: "5px" }}>
            {t.name} -{" "}
            <Link href={`/tour/${t.id}`} style={{ color: "#0070f3", textDecoration: "underline" }}>
              Xem chi tiết
            </Link>
          </div>
        ));
        setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Rất tiếc, tôi chưa tìm thấy tour phù hợp. Bạn có thể thử từ khóa khác." },
        ]);
      }
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "300px",
        height: "400px",
        background: "#f1f1f1",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#0070f3",
          color: "#fff",
          padding: "10px",
          textAlign: "center",
          fontWeight: "600",
        }}
      >
        Chatbot Tư Vấn Tour
      </div>

      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "#0070f3" : "#e0e0e0",
              color: msg.sender === "user" ? "#fff" : "#000",
              padding: "8px 12px",
              borderRadius: "15px",
              maxWidth: "80%",
              wordBreak: "break-word",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập câu hỏi..."
          style={{
            flex: 1,
            border: "none",
            padding: "10px",
            fontSize: "1rem",
            outline: "none",
            borderRadius: "0 0 0 10px",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            background: "#0070f3",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            cursor: "pointer",
            borderRadius: "0 0 10px 0",
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}