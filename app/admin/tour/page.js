"use client";
import { useState } from "react";

export default function TourAdmin() {
  const [tours, setTours] = useState([
    { id: 1, name: "Tour Đà Nẵng", price: 2000000 },
    { id: 2, name: "Tour Phú Quốc", price: 5000000 }
  ]);

  return (
    <div className="min-h-screen bg-blue-50 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">
          Quản lý tour
        </h2>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
          Thêm tour
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-4">Tên tour</th>
              <th>Giá</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {tours.map((t) => (
              <tr key={t.id} className="border-b hover:bg-blue-50">

                <td className="p-4 font-medium">{t.name}</td>

                <td className="text-blue-700 font-semibold">
                  {t.price.toLocaleString()} đ
                </td>

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