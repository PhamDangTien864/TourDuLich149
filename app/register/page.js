'use client';

import { useState } from 'react';
import { User, Phone, Mail, Lock, Calendar, Loader2, ArrowRight, CheckCircle, AtSign, Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    username: '',
    email: '', 
    password: '',
    birth_date: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'full_name':
        if (!value || value.trim().length < 2) {
          newErrors.full_name = 'Họ tên phải từ 2 ký tự';
        } else if (value.length > 100) {
          newErrors.full_name = 'Họ tên quá dài';
        } else {
          delete newErrors.full_name;
        }
        break;
        
      case 'phone_number':
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!value) {
          newErrors.phone_number = 'Vui lòng nhập số điện thoại';
        } else if (!phoneRegex.test(value)) {
          newErrors.phone_number = 'Số điện thoại phải từ 10-11 số';
        } else {
          delete newErrors.phone_number;
        }
        break;
        
      case 'username':
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!value || value.length < 3) {
          newErrors.username = 'Username phải từ 3 ký tự';
        } else if (value.length > 50) {
          newErrors.username = 'Username tối đa 50 ký tự';
        } else if (!usernameRegex.test(value)) {
          newErrors.username = 'Username không được chứa ký tự đặc biệt';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Vui lòng nhập email';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Email không đúng định dạng (ví dụ: customer@gmail.com)';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        if (!value || value.length < 8) {
          newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
        } else if (!passwordRegex.test(value)) {
          newErrors.password = 'Mật khẩu phải có chữ hoa, chữ thường và số';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'birth_date':
        if (!value) {
          newErrors.birth_date = 'Vui lòng chọn ngày sinh';
        } else {
          const birthDate = new Date(value);
          if (isNaN(birthDate.getTime())) {
            newErrors.birth_date = 'Ngày sinh không hợp lệ';
          } else {
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            
            if (age < 16) {
              newErrors.birth_date = 'Bạn phải đủ 16 tuổi mới được đăng ký';
            } else {
              delete newErrors.birth_date;
            }
          }
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      toast.error('Vui lòng sửa các lỗi trước khi đăng ký');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsSuccess(true);
        toast.success("Đăng ký thành công! Check email.");
      } else {
        // Bắt lỗi chi tiết
        if (data.details) {
          // ZodError - hiển thị từng trường lỗi
          if (Array.isArray(data.details)) {
            data.details.forEach(error => {
              toast.error(`${error.path?.[0] || 'Lỗi'}: ${error.message}`);
            });
          } else {
            toast.error(data.details);
          }
        } else {
          // Lỗi khác (username/email đã tồn tại, etc.)
          toast.error(data.error || "Đăng ký thất bại!");
        }
      }
    } catch {
      toast.error("Không thể kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl shadow-blue-100 p-10 md:p-16 border border-slate-100"
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div key="form" exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter">Gia nhập VietTravel ✈️</h1>
                </div>

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Họ và tên */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Họ và tên</label>
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={formData.full_name} 
                        onChange={(e) => handleInputChange('full_name', e.target.value)} 
                        placeholder="Họ tên của ní" 
                        className={`w-full pl-14 pr-6 py-4 border-2 rounded-[24px] focus:bg-white outline-none transition-all font-bold text-slate-800 ${
                          errors.full_name ? 'bg-red-50 border-red-500 focus:border-red-600' : 'bg-slate-50 border-transparent focus:border-blue-600'
                        }`} 
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-red-500 text-xs font-medium ml-4">{errors.full_name}</p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Số điện thoại</label>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone_number} 
                        onChange={(e) => handleInputChange('phone_number', e.target.value)} 
                        placeholder="09xxx" 
                        className={`w-full pl-14 pr-6 py-4 border-2 rounded-[24px] focus:bg-white outline-none transition-all font-bold text-slate-800 ${
                          errors.phone_number ? 'bg-red-50 border-red-500 focus:border-red-600' : 'bg-slate-50 border-transparent focus:border-blue-600'
                        }`} 
                      />
                    </div>
                    {errors.phone_number && (
                      <p className="text-red-500 text-xs font-medium ml-4">{errors.phone_number}</p>
                    )}
                  </div>

                  {/* Username - Dùng AtSign cho lạ */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Username</label>
                    <div className="relative group">
                      <AtSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={formData.username} 
                        onChange={(e) => handleInputChange('username', e.target.value)} 
                        placeholder="tên_đăng_nhập" 
                        className={`w-full pl-14 pr-6 py-4 border-2 rounded-[24px] focus:bg-white outline-none transition-all font-bold text-slate-800 ${
                          errors.username ? 'bg-red-50 border-red-500 focus:border-red-600' : 'bg-slate-50 border-transparent focus:border-blue-600'
                        }`} 
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-500 text-xs font-medium ml-4">{errors.username}</p>
                    )}
                  </div>

                  {/* Email - Ô NHẬP RIÊNG BIỆT */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Địa chỉ Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input 
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        placeholder="ví dụ: ni@gmail.com" 
                        className={`w-full pl-14 pr-6 py-4 border-2 rounded-[24px] focus:bg-white outline-none transition-all font-bold text-slate-800 ${
                          errors.email ? 'bg-red-50 border-red-500 focus:border-red-600' : 'bg-slate-50 border-transparent focus:border-blue-600'
                        }`} 
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs font-medium ml-4">{errors.email}</p>
                    )}
                  </div>

                  {/* Ngày sinh */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Ngày sinh</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input 
                        type="date" 
                        required 
                        value={formData.birth_date} 
                        onChange={(e) => handleInputChange('birth_date', e.target.value)} 
                        className={`w-full pl-14 pr-6 py-4 border-2 rounded-[24px] focus:bg-white outline-none transition-all font-bold text-slate-800 ${
                          errors.birth_date ? 'bg-red-50 border-red-500 focus:border-red-600' : 'bg-slate-50 border-transparent focus:border-blue-600'
                        }`} 
                      />
                    </div>
                    {errors.birth_date && (
                      <p className="text-red-500 text-xs font-medium ml-4">{errors.birth_date}</p>
                    )}
                  </div>

                  {/* Mật khẩu */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Mật khẩu</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required value={formData.password} 
                        onChange={(e) => handleInputChange('password', e.target.value)} 
                        placeholder="••••••••" 
                        className={`w-full pl-14 pr-16 py-4 border-2 rounded-[24px] focus:bg-white outline-none transition-all font-bold text-slate-800 ${
                          errors.password ? 'bg-red-50 border-red-500 focus:border-red-600' : 'bg-slate-50 border-transparent focus:border-blue-600'
                        }`} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs font-medium ml-4">{errors.password}</p>
                    )}
                    
                    {/* Password requirements hints */}
                    <div className="ml-4 mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {formData.password && formData.password.length >= 8 ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={formData.password && formData.password.length >= 8 ? "text-green-600" : "text-gray-500"}>
                          Mật khẩu phải ít nhất 8 ký tự
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {formData.password && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password) ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={formData.password && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                          Chứa chữ hoa, chữ thường, số
                        </span>
                      </div>
                    </div>
                  </div>

                  <button disabled={loading} className="md:col-span-2 w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[28px] font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : <>Đăng ký ngay <ArrowRight size={22} /></>}
                  </button>
                </form>

                <p className="mt-8 text-center text-slate-500 font-bold text-sm">
                  Đã có tài khoản? <Link href="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4">Gửi mail thành công!</h2>
                <p className="text-slate-500 font-bold mb-10 leading-relaxed">Hãy check hòm thư <span className="text-blue-600 underline">{formData.email}</span> <br/> (kể cả Spam) để kích hoạt tài khoản!</p>
                <Link href="/login" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:shadow-blue-200 transition-all">VỀ ĐĂNG NHẬP</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}