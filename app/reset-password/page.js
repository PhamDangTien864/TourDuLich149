'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Đặt lại mật khẩu thành công!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        toast.error(data.error || 'Đặt lại mật khẩu thất bại!');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Lỗi hệ thống, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
          <p className="text-white text-xl">Link đặt lại mật khẩu không hợp lệ</p>
          <button
            onClick={() => router.push('/forgot-password')}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Yêu cầu link mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {success ? (
                <CheckCircle className="text-green-400" size={32} />
              ) : (
                <Lock className="text-blue-400" size={32} />
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {success ? 'Thành Công!' : 'Đặt Lại Mật Khẩu'}
            </h1>
            <p className="text-white/70">
              {success 
                ? 'Mật khẩu của bạn đã được cập nhật'
                : 'Nhập mật khẩu mới cho tài khoản của bạn'
              }
            </p>
          </div>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-blue-400 transition text-white placeholder-white/50"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-blue-400 transition text-white placeholder-white/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-4 rounded-2xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Đặt Lại Mật Khẩu'}
              </button>
            </form>
          )}

          {success && (
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-4 rounded-2xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
            >
              Đăng Nhập Ngay
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
