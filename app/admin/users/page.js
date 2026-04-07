import { prisma } from "@/lib/prisma";

export default async function ManageUsers() {
  const users = await prisma.accounts.findMany({
    where: { is_deleted: false },
    orderBy: { id: 'desc' }
  });

  return (
    <main className="p-10">
      <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">Quản lý người dùng</h1>
      <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Họ tên</th>
              <th className="px-8 py-5">Username</th>
              <th className="px-8 py-5">Vai trò</th>
              <th className="px-8 py-5">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-blue-50/50 transition">
                <td className="px-8 py-6 font-bold">{user.full_name}</td>
                <td className="px-8 py-6 text-slate-500 font-medium">{user.username}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${user.role_id === 1 ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {user.role_id === 1 ? 'Admin' : 'Khách hàng'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <button className="text-red-500 font-black text-xs hover:underline">Khóa tài khoản</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}