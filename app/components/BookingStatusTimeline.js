'use client';

import { CheckCircle, Clock, XCircle, AlertCircle, ChevronRight } from 'lucide-react';

export default function BookingStatusTimeline({ currentStatus, logs = [] }) {
  const statusFlow = [
    { key: 'pending', label: 'Chờ xử lý', icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-300' },
    { key: 'awaiting_payment', label: 'Chờ thanh toán', icon: Clock, color: 'bg-yellow-100 text-yellow-600 border-yellow-300' },
    { key: 'deposit_paid', label: 'Đã đặt cọc', icon: CheckCircle, color: 'bg-blue-100 text-blue-600 border-blue-300' },
    { key: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle, color: 'bg-green-100 text-green-600 border-green-300' },
    { key: 'completed', label: 'Hoàn thành', icon: CheckCircle, color: 'bg-green-100 text-green-600 border-green-300' },
    { key: 'cancelled', label: 'Đã hủy', icon: XCircle, color: 'bg-red-100 text-red-600 border-red-300' },
    { key: 'refunded', label: 'Đã hoàn tiền', icon: AlertCircle, color: 'bg-purple-100 text-purple-600 border-purple-300' }
  ];

  const getCurrentStatusIndex = () => {
    return statusFlow.findIndex(status => status.key === currentStatus?.toLowerCase());
  };

  const currentIndex = getCurrentStatusIndex();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-slate-800">Trạng thái đặt tour</h3>
      
      {/* Status Timeline */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
        {statusFlow.map((status, index) => {
          const StatusIcon = status.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isCancelled = status.key === 'cancelled' && currentIndex >= 0;
          
          return (
            <div key={status.key} className="flex items-center flex-shrink-0">
              <div className={`flex flex-col items-center ${index < statusFlow.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white scale-110 shadow-lg'
                    : isCompleted && !isCancelled
                    ? 'bg-green-500 text-white'
                    : isCancelled
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted && !isCancelled ? <CheckCircle size={20} /> : <StatusIcon size={20} />}
                </div>
                <span className={`text-xs font-bold mt-2 text-center ${
                  isCurrent
                    ? 'text-blue-600'
                    : isCompleted && !isCancelled
                    ? 'text-green-600'
                    : isCancelled
                    ? 'text-red-600'
                    : 'text-slate-400'
                }`}>
                  {status.label}
                </span>
              </div>
              {index < statusFlow.length - 1 && (
                <div className={`flex-1 h-1 mx-2 transition-all ${
                  isCompleted && !isCancelled
                    ? 'bg-green-500'
                    : isCancelled
                    ? 'bg-red-500'
                    : 'bg-slate-200'
                }`} style={{ minWidth: '40px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Status Logs */}
      {logs.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 className="font-black text-slate-800 mb-4">Lịch sử thay đổi</h4>
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.action === 'booking_created'
                    ? 'bg-blue-100 text-blue-600'
                    : log.action.includes('cancel')
                    ? 'bg-red-100 text-red-600'
                    : log.action.includes('payment')
                    ? 'bg-green-100 text-green-600'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <Clock size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-sm">
                      {log.action === 'booking_created' && 'Đặt tour mới'}
                      {log.action === 'status_change_awaiting_payment' && 'Chờ thanh toán'}
                      {log.action === 'status_change_deposit_paid' && 'Đã đặt cọc'}
                      {log.action === 'status_change_confirmed' && 'Đã xác nhận'}
                      {log.action === 'status_change_completed' && 'Hoàn thành'}
                      {log.action === 'status_change_cancelled' && 'Đã hủy'}
                      {log.action === 'status_change_refunded' && 'Đã hoàn tiền'}
                    </p>
                    <span className="text-xs text-slate-500">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-slate-600 text-sm mt-1">{log.notes}</p>
                  )}
                  {log.actor_type && (
                    <p className="text-slate-500 text-xs mt-1">
                      bởi {log.actor_type === 'customer' ? 'khách hàng' : log.actor_type === 'admin' ? 'admin' : 'hệ thống'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
