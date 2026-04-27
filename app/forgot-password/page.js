'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        toast.success('Link đặt lại mật khẩu đã được gửi!');
      } else {
        toast.error(data.error || 'Gửi email thất bại!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Lỗi hệ thống, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={20} />
            <span>Quay lại đăng nhập</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-blue-400" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {sent ? 'Đã Gửi Email!' : 'Quên Mật Khẩu?'}
            </h1>
            <p className="text-white/70">
              {sent 
                ? 'Kiểm tra email của bạn để nhận link đặt lại mật khẩu'
                : 'Nhập email để nhận link đặt lại mật khẩu'
              }
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-blue-400 transition text-white placeholder-white/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-4 rounded-2xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Gửi Link Đặt Lại'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
                <p className="text-green-300 font-medium">
                  ✓ Email đã được gửi đến <strong>{email}</strong>
                </p>
                <p className="text-green-400/70 text-sm mt-2">
                  Link có hiệu lực trong 1 giờ
                </p>
              </div>

              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold text-white transition-all"
              >
                Gửi Lại Email
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
