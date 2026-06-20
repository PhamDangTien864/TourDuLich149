'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, MessageSquare, TrendingUp, Users, Clock, ThumbsUp } from 'lucide-react';

export default function ChatAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/chat-analytics/summary'),
        fetch('/api/admin/chat-analytics'),
      ]);
      const summaryData = await summaryRes.json();
      const analyticsData = await analyticsRes.json();
      setSummary(summaryData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Lỗi tải analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Phân tích Chatbot</h1>
        <p className="text-gray-600 mt-2">Theo dõi và phân tích hiệu suất chatbot</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'faq'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Câu hỏi thường gặp
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users size={24} className="text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Tổng phiên</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalSessions || 0}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageSquare size={24} className="text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Tổng tin nhắn</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalMessages || 0}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 size={24} className="text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Câu hỏi khác nhau</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalQuestions || 0}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ThumbsUp size={24} className="text-yellow-600" />
                </div>
                <span className="text-sm text-gray-500">Độ hài lòng TB</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {summary?.avgSatisfaction ? summary.avgSatisfaction.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Top Questions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top 10 Câu hỏi thường gặp</h2>
            <div className="space-y-3">
              {summary?.topQuestions?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.question}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.answer}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span className="text-sm">{new Date(item.last_asked).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <TrendingUp size={16} />
                      <span className="font-bold">{item.question_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tất cả câu hỏi thường gặp</h2>
          <div className="space-y-3">
            {analytics.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.question}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.answer}</p>
                </div>
                <div className="flex items-center gap-4">
                  {item.satisfaction_score && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <ThumbsUp size={16} />
                      <span className="font-bold">{item.satisfaction_score.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">{new Date(item.last_asked).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp size={16} />
                    <span className="font-bold">{item.question_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
