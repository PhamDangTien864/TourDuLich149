import AdminSidebar from "./components/AdminSidebar";

// Lưu ý: Không cần import globals.css ở đây nếu layout gốc đã có.
// Nếu ní vẫn muốn import, đường dẫn đúng phải là: import "../globals.css";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar của Admin */}
      <AdminSidebar />
      
      {/* Nội dung chính bên phải */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}