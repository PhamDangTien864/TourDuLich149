'use client';

import { 
  LayoutDashboard, 
  Map, 
  Users, 
  ShoppingCart, 
  ShieldCheck, 
  ChevronRight,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  
  // Danh sách các menu khớp với ảnh ní gửi
  const menus = [
    { name: "Dashboard", icon: <LayoutDashboard size={22} />, href: "/admin" },
    { name: "Quản lý Tour", icon: <Map size={22} />, href: "/admin/tours" },
    { name: "Người dùng", icon: <Users size={22} />, href: "/admin/users" },
    { name: "Đơn đặt", icon: <ShoppingCart size={22} />, href: "/admin/bookings" },
    { name: "Phân quyền", icon: <ShieldCheck size={22} />, href: "/admin/roles" },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white min-h-screen p-8 hidden md:flex flex-col shrink-0 border-r border-white/5 shadow-2xl">
      {/* Logo VietTravel Luxury */}
      <div className="mb-12 px-2">
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
          Viet<span className="text-blue-500">Travel</span>
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 ml-1">
          Admin Control
        </p>
      </div>

      {/* Danh sách Menu */}
      <nav className="flex-1 space-y-2">
        {menus.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group flex items-center justify-between p-4 rounded-2xl font-bold transition-all duration-300 ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`${isActive ? 'text-white' : 'group-hover:text-blue-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="tracking-tight">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={16} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar - Tài khoản Admin */}
      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="bg-white/5 p-4 rounded-[24px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black text-sm">
              AD
            </div>
            <div>
              <p className="text-xs font-black">Admin</p>
              <p className="text-[10px] text-slate-500 font-bold">Quản trị viên</p>
            </div>
          </div>
          <Link href="/" title="Đăng xuất">
             <LogOut size={18} className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer" />
          </Link>
        </div>
      </div>
    </aside>
  );
}