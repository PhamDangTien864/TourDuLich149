'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus('error');
        setMessage('Link xác nhận không hợp lệ');
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}&email=${email}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Xác nhận email thất bại');
        }
      } catch (error) {
        console.error('Verify email error:', error);
        setStatus('error');
        setMessage('Lỗi hệ thống, vui lòng thử lại');
      }
    };

    verifyEmail();
  }, [token, email, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          {status === 'loading' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="text-blue-400 animate-spin" size={40} />
              </div>
              <h1 className="text-2xl font-bold text-white">Đang xác nhận email...</h1>
              <p className="text-white/70">Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-400" size={40} />
              </div>
              <h1 className="text-2xl font-bold text-white">Xác Nhận Thành Công!</h1>
              <p className="text-white/70">{message}</p>
              <p className="text-green-400/70 text-sm">Đang chuyển đến trang đăng nhập...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="text-red-400" size={40} />
              </div>
              <h1 className="text-2xl font-bold text-white">Xác Nhận Thất Bại</h1>
              <p className="text-white/70">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-4 rounded-2xl font-bold text-white transition-all"
              >
                Về Trang Đăng Nhập
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
