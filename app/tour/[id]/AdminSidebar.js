'use client';
import { LayoutDashboard, Map, Users, ShoppingCart, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  
  const menus = [
    { name: "Dashboard", icon: <LayoutDashboard />, href: "/admin" },
    { name: "Quản lý Tour", icon: <Map />, href: "/admin/tours" },
    { name: "Người dùng", icon: <Users />, href: "/admin/users" },
    { name: "Đơn đặt", icon: <ShoppingCart />, href: "/admin/bookings" },
    { name: "Phân quyền", icon: <ShieldCheck />, href: "/admin/roles" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 hidden md:block shrink-0">
      <h2 className="text-2xl font-black mb-10 text-blue-400 tracking-tighter">VIETTRAVEL</h2>
      <nav className="space-y-2">
        {menus.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${
              pathname === item.href ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}