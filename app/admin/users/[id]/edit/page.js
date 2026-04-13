import { prisma } from "@/lib/prisma";
import AdminSidebar from "../../../components/AdminSidebar";
import { ArrowLeft, Save, User, Shield, Phone, Calendar, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditUserPage({ params }) {
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);
  
  if (isNaN(userId)) {
    notFound();
  }

  const user = await prisma.accounts.findUnique({
    where: { 
      id: userId,
      is_deleted: false 
    },
    select: {
      id: true,
      username: true,
      full_name: true,
      email: true,
      phone_number: true,
      birth_date: true,
      role: true,
      is_verified: true
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/users"
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-black mb-2">S thông tin User</h1>
                <p className="text-blue-100">Chỉnh sửa thông tin cho: {user.full_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    H và tên
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    defaultValue={user.full_name}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={user.username}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                    required
                    readOnly
                  />
                  <p className="text-xs text-slate-500 mt-1">Username không thay đổi</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={user.email}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    defaultValue={user.phone_number}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                    required
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    defaultValue={user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : ''}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <Shield size={16} className="inline mr-2" />
                    Vai trò
                  </label>
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  >
                    <option value={2}>User</option>
                    <option value={1}>Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">Trang thái tài kho n</h3>
                  <p className="text-sm text-slate-600">
                    {user.is_verified ? 
                      <span className="text-green-600">Ðã kích hoat</span> : 
                      <span className="text-red-600">Chua kích hoat</span>
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_verified"
                      defaultChecked={user.is_verified}
                      className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-bold text-slate-700">Ðã kích hoat</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
              <Link
                href="/admin/users"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Huy
              </Link>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <Save size={20} />
                Luu thay i
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
