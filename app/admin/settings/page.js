"use client";

import { useState } from 'react';
import AdminLayout from "../components/AdminLayout";
import { Settings, Save, Bell, Shield, Database, Globe } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'VietTravel Luxury',
    siteDescription: 'Trai nghiem du lich Luxury cung tri tue nhan tao so 1 Viet Nam',
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
      
      toast.success(`Cap nhat cau hinh ${section} thanh cong!`);
    } catch (error) {
      toast.error('Loi khi cap nhat cau hinh');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Tong quan', icon: Settings },
    { id: 'notifications', label: 'Thong bao', icon: Bell },
    { id: 'security', label: 'Bao mat', icon: Shield },
    { id: 'database', label: 'Database', icon: Database }
  ];

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Cai dat</h1>
          <p className="text-slate-500">Quan ly cau hinh he thong</p>
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
                Cai dat tong quan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ten website
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
                    Email lien he
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
                    So dien thoai
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
                    Dia chi
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
                    Mo ta website
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
                  onClick={() => handleSave('tong quan')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  Luu cau hinh
                </button>
              </div>
            </div>
          )}

          {/* Other tabs */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                Cai dat thong bao
              </h2>
              <p className="text-slate-500">Cai dat thong bao se duoc them sau...</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                Cai dat bao mat
              </h2>
              <p className="text-slate-500">Cai dat bao mat se duoc them sau...</p>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Database size={20} className="text-blue-600" />
                Cai dat Database
              </h2>
              <p className="text-slate-500">Cai dat database se duoc them sau...</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
