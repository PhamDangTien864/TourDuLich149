"use client";

import { useState } from "react";

export default function OrderAdmin() {
  const [search, setSearch] = useState("");

  const orders = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      tour: "Đà Nẵng",
      date: "12/03/2026",
      status: "Đã thanh toán",
    },
    {
      id: 2,
      name: "Trần Thị B",
      tour: "Phú Quốc",
      date: "15/03/2026",
      status: "Chờ xử lý",
    },
    {
      id: 3,
      name: "Lê Văn C",
      tour: "Nha Trang",
      date: "18/03/2026",
      status: "Đã hủy",
    },
  ];

  const filtered = orders.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">
          Quản lý đơn đặt tour
        </h1>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow">
          Tạo đơn
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <input
          type="text"
          placeholder="Tìm theo tên khách..."
          className="w-full outline-none border px-3 py-2 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-4">Khách hàng</th>
              <th>Tour</th>
              <th>Ngày đặt</th>
              <th>Trạng thái</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b hover:bg-blue-50">
                <td className="p-4 font-medium">{order.name}</td>
                <td>{order.tour}</td>
                <td>{order.date}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                    ${
                      order.status === "Đã thanh toán"
                        ? "bg-green-200 text-green-700"
                        : order.status === "Chờ xử lý"
                        ? "bg-yellow-200 text-yellow-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="text-center space-x-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">
                    Xem
                  </button>

                  <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600">
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