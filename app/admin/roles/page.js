import { ShieldCheck, UserCog, Lock, Key, ShieldAlert } from "lucide-react";

export default function ManageRoles() {
  // Nhớ để cứng danh sách này luôn cho mình, vừa đẹp vừa không lo lỗi Prisma bảng Roles
  const roles = [
    { id: 1, role_name: "Admin", desc: "Toàn quyền hệ thống, quản lý tour và khách hàng." },
    { id: 2, role_name: "Khách hàng", desc: "Quyền hạn cơ bản: xem tour, đặt tour và quản lý lịch sử." }
  ];

  return (
    <main className="p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
        <ShieldCheck className="text-blue-600" size={32} /> Phân quyền hệ thống
        </h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">
          Hệ thống quản lý cấp độ truy cập VietTravel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roles.map((role) => (
          <div key={role.id} className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 rounded-3xl transition-colors ${role.id === 1 ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                {role.id === 1 ? <ShieldAlert size={32} /> : <UserCog size={32} />}
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Cấp độ: 0{role.id}</span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-3">{role.role_name}</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              {role.desc}
            </p>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full border-4 border-white bg-slate-100" />
                <div className="w-9 h-9 rounded-full border-4 border-white bg-slate-200" />
                <div className="w-9 h-9 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">+5</div>
              </div>
              <button className="bg-slate-50 hover:bg-slate-900 hover:text-white p-3 rounded-2xl transition-all">
                <Lock size={18} />
              </button>
            </div>
          </div>
        ))}

        <div className="border-4 border-dashed border-slate-100 p-10 rounded-[45px] flex flex-col items-center justify-center text-slate-300 hover:border-blue-200 hover:text-blue-300 transition-all cursor-pointer group">
           <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
              <Key size={32} />
           </div>
           <span className="font-black text-xs uppercase tracking-widest">Tạo vai trò mới</span>
        </div>
      </div>
    </main>
  );
}