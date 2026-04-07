"use client";

import { useState } from "react";

export default function RoleAdmin() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Admin",
      permissions: ["Quản lý tour", "Quản lý người dùng", "Quản lý đơn", "Thanh toán"],
    },
    {
      id: 2,
      name: "User",
      permissions: ["Đặt tour", "Thanh toán"],
    },
  ]);

  return (
    <div className="min-h-screen bg-blue-50 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">
          Phân quyền hệ thống
        </h1>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow">
          Thêm vai trò
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-4">Vai trò</th>
              <th>Quyền</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b hover:bg-blue-50">

                {/* Role */}
                <td className="p-4 font-semibold text-blue-700">
                  {role.name}
                </td>

                {/* Permissions */}
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((p, index) => (
                      <span
                        key={index}
                        className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Actions */}
                <td className="text-center space-x-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">
                    Sửa
                  </button>

                  <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
                    Xóa
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}