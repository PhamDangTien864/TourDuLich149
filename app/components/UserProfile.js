"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockUser = {
      id: 1,
      full_name: "Nguyen Van A",
      username: "nguyenvana",
      phone_number: "0123456789",
      birth_date: "1990-01-01",
      role: "user"
    };

    const mockBookings = [
      {
        id: 1,
        tour: {
          id: 1,
          title: "Tour Da Nang 3N2D",
          location_name: "Da Nang",
          price: 2999000
        },
        start_date: "2024-02-15",
        end_date: "2024-02-17",
        total_amount: 5998000,
        paid_amount: 5998000,
        is_confirmed: true,
        customer: {
          full_name: "Nguyen Van A",
          phone_number: "0123456789"
        },
        created_at: "2024-01-10"
      },
      {
        id: 2,
        tour: {
          id: 2,
          title: "Tour Phu Quoc 4N3D",
          location_name: "Phu Quoc",
          price: 4999000
        },
        start_date: "2024-03-20",
        end_date: "2024-03-23",
        total_amount: 9998000,
        paid_amount: 0,
        is_confirmed: false,
        customer: {
          full_name: "Nguyen Van A",
          phone_number: "0123456789"
        },
        created_at: "2024-01-15"
      }
    ];

    setUserData(mockUser);
    setBookings(mockBookings);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
        <h1 className="text-3xl font-black mb-2">Tài khoản của tôi</h1>
        <p className="text-blue-100">Quản lý thông tin và lịch sử đặt tour</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {["profile", "bookings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-black transition-colors ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab === "profile" ? "Thông tin cá nhân" : "Lịch sử đặt tour"}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 border border-gray-200"
        >
          <h2 className="text-2xl font-black mb-6">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Họ tên
              </label>
              <input
                type="text"
                value={userData?.full_name || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={userData?.username || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="text"
                value={userData?.phone_number || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ngày sinh
              </label>
              <input
                type="text"
                value={userData?.birth_date ? new Date(userData.birth_date).toLocaleDateString("vi-VN") : ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                readOnly
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-colors">
              Cập nhật thông tin
            </button>
            <button className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-black hover:bg-red-100 transition-colors">
              Đổi mật khẩu
            </button>
          </div>
        </motion.div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {booking.tour.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {booking.tour.location_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(booking.start_date).toLocaleDateString("vi-VN")} - {new Date(booking.end_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-600">
                    {Number(booking.total_amount).toLocaleString()}d
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block mt-2 ${
                    booking.is_confirmed 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {booking.is_confirmed ? "Đã xác nhận" : "Chờ xác nhận"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Khách hàng: {booking.customers.full_name}</p>
                    <p>SDT: {booking.customers.phone_number}</p>
                    <p>Ngày đặt: {new Date(booking.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="flex gap-2">
                    {booking.is_confirmed && booking.paid_amount === 0 && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-xl font-black hover:bg-green-700 transition-colors">
                        Thanh toán
                      </button>
                    )}
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black hover:bg-blue-700 transition-colors">
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 font-bold">Bạn chưa đặt tour nào.</p>
              <p className="text-gray-400 text-sm mt-2">Khám phá các tour tuyệt vời của chúng tôi!</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-colors mt-4">
                Xem tour
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
