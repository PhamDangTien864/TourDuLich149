import "./globals.css";
import Chatbot from "./components/Chatbot"; // Ní nhớ import đúng đường dẫn nhé

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
        
        {/* Chỉ cần một dòng này là cân cả website */}
        <Chatbot />
      </body>
    </html>
  );
}