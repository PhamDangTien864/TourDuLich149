'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { User, Phone, Mail, Calendar, CreditCard, MapPin, Lock, Save, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PROVINCES, DISTRICTS, WARDS } from './locationData';

export default function CustomerMePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile data
  const [profile, setProfile] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    birth_date: '',
    identity_card: '',
    address: '',
    province_id: '',
    district_id: '',
    ward_id: ''
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailVerification: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(userData);
      const res = await fetch(`/api/customers/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          email: data.email || '',
          birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
          identity_card: data.identity_card || '',
          address: data.address || '',
          province_id: data.province_id || '',
          district_id: data.district_id || '',
          ward_id: data.ward_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const userData = localStorage.getItem('user_data');
      const user = JSON.parse(userData);
      
      const res = await fetch(`/api/customers/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        toast.success('Cập nhật thông tin thành công!');
      } else {
        toast.error('Cập nhật thất bại!');
      }
    } catch (error) {
      toast.error('Lỗi hệ thống!');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setSaving(true);
    
    try {
      const userData = localStorage.getItem('user_data');
      const user = JSON.parse(userData);
      
      const res = await fetch('/api/customers/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          emailVerification: passwordData.emailVerification
        })
      });

      if (res.ok) {
        toast.success('Đổi mật khẩu thành công!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          emailVerification: ''
        });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Đổi mật khẩu thất bại!');
      }
    } catch (error) {
      toast.error('Lỗi hệ thống!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 font-bold">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-800 mb-8">Tôi</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'password'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đổi mật khẩu
            </button>
          </div>

          {activeTab === 'profile' ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <User className="text-blue-600" size={24} />
                Cập nhật thông tin
              </h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={profile.phone_number}
                        onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Ngày sinh
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="date"
                        value={profile.birth_date}
                        onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Số CCCD/CMND
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={profile.identity_card}
                        onChange={(e) => setProfile({ ...profile, identity_card: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập số CCCD/CMND"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={20} />
                    Địa chỉ
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Tỉnh/Thành phố
                      </label>
                      <select
                        value={profile.province_id}
                        onChange={(e) => setProfile({ ...profile, province_id: e.target.value, district_id: '', ward_id: '' })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {PROVINCES.map(province => (
                          <option key={province.id} value={province.id}>{province.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Quận/Huyện
                      </label>
                      <select
                        value={profile.district_id}
                        onChange={(e) => setProfile({ ...profile, district_id: e.target.value, ward_id: '' })}
                        disabled={!profile.province_id}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition disabled:bg-slate-100"
                      >
                        <option value="">Chọn quận/huyện</option>
                        {DISTRICTS.filter(d => d.provinceCode === profile.province_id).map(district => (
                          <option key={district.id} value={district.id}>{district.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Phường/Xã
                      </label>
                      <select
                        value={profile.ward_id}
                        onChange={(e) => setProfile({ ...profile, ward_id: e.target.value })}
                        disabled={!profile.district_id}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition disabled:bg-slate-100"
                      >
                        <option value="">Chọn phường/xã</option>
                        {WARDS.filter(w => w.districtCode === profile.district_id).map(ward => (
                          <option key={ward.id} value={ward.id}>{ward.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Địa chỉ cụ thể
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2"
                >
                  {saving ? 'Đang lưu...' : <><Save size={20} /> Lưu thông tin</>}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <Lock className="text-blue-600" size={24} />
                Đổi mật khẩu
              </h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm font-bold text-slate-600 mb-4">
                    Hoặc xác nhận qua email:
                  </p>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={passwordData.emailVerification}
                      onChange={(e) => setPasswordData({ ...passwordData, emailVerification: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
                      placeholder="Nhập email để xác nhận"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2"
                >
                  {saving ? 'Đang xử lý...' : <><Key size={20} /> Đổi mật khẩu</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
