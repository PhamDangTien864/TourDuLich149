'use client';

import { useState, useEffect } from 'react';
import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, DollarSign, MapPin, Star, Calendar, Download, Filter, X } from "lucide-react";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 6)));
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!analyticsData) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Overview sheet
    const overviewData = [
      ['Metric', 'Value'],
      ['Tổng doanh thu', `${Number(totalRevenue?._sum?.total_amount || 0).toLocaleString()}đ`],
      ['Booking gần đây', recentBookings?.length || 0],
      ['Tổng khách hàng', customerStats?.reduce((sum, stat) => sum + stat._count.id, 0) || 0],
      ['Tỷ lệ hủy booking', `${cancellationRate}%`],
      ['Đánh giá trung bình', `${reviewStats?.avgRating || 0}/5`],
      ['Tổng số đánh giá', reviewStats?.totalReviews || 0],
    ];
    const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, overviewWs, 'Tổng quan');

    // Monthly revenue sheet
    const monthlyData = [
      ['Tháng', 'Doanh thu', 'Số booking'],
      ...(monthlyRevenue || []).map(m => [m.month, Number(m.revenue), m.bookings])
    ];
    const monthlyWs = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, monthlyWs, 'Doanh thu theo tháng');

    // Top tours sheet
    const toursData = [
      ['STT', 'Tour', 'Địa điểm', 'Doanh thu', 'Số booking'],
      ...(topTours || []).map((t, i) => [
        i + 1,
        t.tours?.title || 'N/A',
        t.tours?.location_name || 'N/A',
        Number(t._sum.total_amount),
        t._count.id
      ])
    ];
    const toursWs = XLSX.utils.aoa_to_sheet(toursData);
    XLSX.utils.book_append_sheet(wb, toursWs, 'Top Tours');

    // Recent bookings sheet
    const bookingsData = [
      ['Khách hàng', 'SĐT', 'Tour', 'Địa điểm', 'Số tiền', 'Ngày đi'],
      ...(recentBookings || []).map(b => [
        b.customers?.full_name || 'N/A',
        b.customers?.phone_number || 'N/A',
        b.tours?.title || 'N/A',
        b.tours?.location_name || 'N/A',
        Number(b.total_amount),
        new Date(b.start_date).toLocaleDateString('vi-VN')
      ])
    ];
    const bookingsWs = XLSX.utils.aoa_to_sheet(bookingsData);
    XLSX.utils.book_append_sheet(wb, bookingsWs, 'Booking gần đây');

    // Province stats sheet
    const provinceData = [
      ['Tỉnh thành', 'Số tour'],
      ...(provinceStats || []).map(p => [p.province, p.count])
    ];
    const provinceWs = XLSX.utils.aoa_to_sheet(provinceData);
    XLSX.utils.book_append_sheet(wb, provinceWs, 'Theo tỉnh thành');

    // Promotion stats sheet
    const promoData = [
      ['Mã khuyến mãi', 'Giảm giá (%)', 'Số lần dùng'],
      ...(promotionStats || []).map(p => [p.code, p.discountValue, p.usedCount])
    ];
    const promoWs = XLSX.utils.aoa_to_sheet(promoData);
    XLSX.utils.book_append_sheet(wb, promoWs, 'Khuyến mãi');

    // Generate filename with date range
    const startStr = startDate.toLocaleDateString('vi-VN').replace(/\//g, '-');
    const endStr = endDate.toLocaleDateString('vi-VN').replace(/\//g, '-');
    const filename = `Analytics_${startStr}_to_${endStr}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  if (loading) {
    return (
      <div>
        <div className="p-8 flex items-center justify-center">
          <div className="text-slate-400 font-bold">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div>
        <div className="p-8 flex items-center justify-center">
          <div className="text-slate-400 font-bold">No data available</div>
        </div>
      </div>
    );
  }

  const {
    totalRevenue,
    monthlyRevenue,
    topTours,
    recentBookings,
    customerStats,
    tourStats,
    provinceStats,
    reviewStats,
    promotionStats,
    cancellationRate
  } = analyticsData || {};

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">Thống kê Analytics</h1>
              <p className="text-slate-500 font-bold">Phân tích và báo cáo kinh doanh VietTravel Luxury</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition-colors"
              >
                <Download size={16} />
                Export Excel
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <Filter size={16} />
              <span>Lọc theo ngày:</span>
            </div>
            <div className="flex items-center gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="px-3 py-2 border border-slate-200 rounded-lg font-bold text-sm"
                dateFormat="dd/MM/yyyy"
              />
              <span className="text-slate-400">-</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="px-3 py-2 border border-slate-200 rounded-lg font-bold text-sm"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <span className="text-green-500 text-sm font-bold">+15%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {Number(totalRevenue?._sum?.total_amount || 0).toLocaleString()}đ
            </h3>
            <p className="text-slate-500 text-sm font-bold">Tổng doanh thu</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-green-600" size={20} />
              </div>
              <span className="text-green-500 text-sm font-bold">+25%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {recentBookings?.length || 0}
            </h3>
            <p className="text-slate-500 text-sm font-bold">Booking gần đây</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="text-purple-600" size={20} />
              </div>
              <span className="text-green-500 text-sm font-bold">+12%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {customerStats?.reduce((sum, stat) => sum + stat._count.id, 0) || 0}
            </h3>
            <p className="text-slate-500 text-sm font-bold">Tổng khách hàng</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <X className="text-red-600" size={20} />
              </div>
              <span className="text-red-500 text-sm font-bold">{cancellationRate}%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {cancellationRate}%
            </h3>
            <p className="text-slate-500 text-sm font-bold">Tỷ lệ hủy booking</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Doanh thu theo tháng
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <MapPin className="text-yellow-500" size={20} />
              Thống kê theo tỉnh thành
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={provinceStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.province}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {provinceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Thống kê đánh giá
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-700 font-bold">Đánh giá trung bình</span>
                <span className="font-black text-yellow-600">{reviewStats?.avgRating || 0}/5</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-700 font-bold">Tổng số đánh giá</span>
                <span className="font-black text-slate-800">{reviewStats?.totalReviews || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-700 font-bold">Đánh giá 5 sao</span>
                <span className="font-black text-green-600">{reviewStats?.fiveStar || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Thống kê khuyến mãi
            </h3>
            <div className="space-y-4">
              {(promotionStats || []).map((promo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">{promo.code}</p>
                    <p className="text-xs text-slate-500 font-bold">Giảm {promo.discountValue}%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600">{promo.usedCount} lần</p>
                    <p className="text-xs text-slate-400 font-bold">Đã dùng</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Tours Table */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            Top Tours doanh thu
          </h3>
          <div className="space-y-4">
            {(topTours || []).map((tour, index) => (
              <div key={tour.tour_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{tour.tours?.title || 'Tour không tên'}</p>
                    <p className="text-xs text-slate-500 font-bold">{tour.tours?.location_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-green-600">
                    {Number(tour._sum.total_amount).toLocaleString()}đ
                  </p>
                  <p className="text-xs text-slate-400 font-bold">{tour._count.id} booking</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Booking gần đây nhất
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Tour</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Ngày đi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(recentBookings || []).map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-800">{booking.customers?.full_name || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{booking.customers?.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{booking.tours?.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{booking.tours?.location_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-green-600">
                        {Number(booking.total_amount).toLocaleString()}đ
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600 font-bold">
                        {new Date(booking.start_date).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}