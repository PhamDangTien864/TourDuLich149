"use client";

import { useState } from 'react';
import { Settings, Save, Bell, Shield, Database, Globe } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'VietTravel Luxury',
    siteDescription: 'Trải nghiệm du lịch Luxury cùng trí tuệ nhân tạo số 1 Việt Nam',
    contactEmail: 'info@viettravel.com',
    contactPhone: '0862640720',
    address: '484 Lạch Tray, Đổng Quốc Bình, Hải Phòng',
    facebookUrl: 'https://www.facebook.com/penixillin/',
    zaloUrl: 'https://zalo.me/0862640720'
  });

  const handleSave = async (section) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Cập nhật cấu hình ${section} thành công!`);
    } catch (error) {
      toast.error('Lỗi khi cập nhật cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Tổng quan', icon: Settings },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'database', label: 'Database', icon: Database }
  ];

  return (
    <div>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Cài đặt</h1>
          <p className="text-slate-500">Quản lý cấu hình hệ thống</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Globe size={20} className="text-blue-600" />
                Cài đặt tổng quan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tên website
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.contactPhone}
                    onChange={(e) => setGeneralSettings({...generalSettings, contactPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mô tả website
                  </label>
                  <textarea
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={generalSettings.facebookUrl}
                    onChange={(e) => setGeneralSettings({...generalSettings, facebookUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Zalo URL
                  </label>
                  <input
                    type="url"
                    value={generalSettings.zaloUrl}
                    onChange={(e) => setGeneralSettings({...generalSettings, zaloUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSave('tổng quan')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  Lưu cấu hình
                </button>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                Cài đặt thông báo
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">Thông báo booking mới</p>
                    <p className="text-sm text-slate-500">Nhận thông báo khi có booking mới</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">Thông báo đánh giá mới</p>
                    <p className="text-sm text-slate-500">Nhận thông báo khi có đánh giá mới</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">Thông báo email</p>
                    <p className="text-sm text-slate-500">Gửi thông báo qua email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSave('thông báo')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  Lưu cấu hình
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                Cài đặt bảo mật
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    placeholder="587"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    SMTP Email
                  </label>
                  <input
                    type="email"
                    placeholder="your-email@gmail.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">Bảo mật 2FA</p>
                    <p className="text-sm text-slate-500">Bật xác thực 2 yếu tố cho admin</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded text-blue-600" />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSave('bảo mật')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  Lưu cấu hình
                </button>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Database size={20} className="text-blue-600" />
                Cài đặt Database
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="font-bold text-green-800 mb-2">📊 Thống kê Database</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-600">1,234</p>
                      <p className="text-xs text-green-700 font-bold">Tours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-600">5,678</p>
                      <p className="text-xs text-green-700 font-bold">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-600">9,012</p>
                      <p className="text-xs text-green-700 font-bold">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-600">45.2 MB</p>
                      <p className="text-xs text-green-700 font-bold">Size</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <Database size={18} />
                    Backup Database
                  </button>
                  
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <Database size={18} />
                    Restore Database
                  </button>
                  
                  <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <Database size={18} />
                    Optimize Database
                  </button>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="font-bold text-yellow-800">⚠️ Lưu ý</p>
                  <p className="text-sm text-yellow-700 mt-2">
                    Backup database định kỳ để tránh mất dữ liệu. Khuyến nghị backup hàng ngày.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
