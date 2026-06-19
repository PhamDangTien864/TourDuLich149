'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Play, Check, X, Save } from 'lucide-react';

export default function PromptConfigPage() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [testPrompt, setTestPrompt] = useState(null);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    tone: 'professional',
    is_test: false,
  });
  const [error, setError] = useState('');
  const [activateError, setActivateError] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/admin/prompt-config');
      const data = await res.json();
      setPrompts(data);
    } catch (error) {
      console.error('Lỗi tải danh sách prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingPrompt
        ? `/api/admin/prompt-config/${editingPrompt.id}`
        : '/api/admin/prompt-config';
      const method = editingPrompt ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingPrompt(null);
        setFormData({ name: '', system_prompt: '', tone: 'professional', is_test: false });
        fetchPrompts();
      } else {
        const data = await res.json();
        setError(data.error || 'Không thể lưu prompt');
      }
    } catch (error) {
      console.error('Lỗi lưu prompt:', error);
      setError('Lỗi kết nối server');
    }
  };

  const handleActivate = async (id) => {
    setActivateError('');
    try {
      const res = await fetch(`/api/admin/prompt-config/${id}/activate`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchPrompts();
      } else {
        const data = await res.json();
        setActivateError(data.error || 'Không thể kích hoạt prompt');
      }
    } catch (error) {
      console.error('Lỗi activate prompt:', error);
      setActivateError('Lỗi kết nối server');
    }
  };

  const handleDeactivate = async (id) => {
    setActivateError('');
    try {
      const res = await fetch(`/api/admin/prompt-config/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      });
      if (res.ok) {
        fetchPrompts();
      } else {
        const data = await res.json();
        setActivateError(data.error || 'Không thể dừng prompt');
      }
    } catch (error) {
      console.error('Lỗi deactivate prompt:', error);
      setActivateError('Lỗi kết nối server');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa prompt này?')) return;
    try {
      const res = await fetch(`/api/admin/prompt-config/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPrompts();
      }
    } catch (error) {
      console.error('Lỗi xóa prompt:', error);
    }
  };

  const handleTest = async () => {
    setTestLoading(true);
    setTestResponse('');
    try {
      const res = await fetch('/api/admin/prompt-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: testPrompt.system_prompt,
          message: testMessage,
          history: [],
        }),
      });
      const data = await res.json();
      setTestResponse(data.text || data.error);
    } catch (error) {
      setTestResponse('Lỗi test prompt');
    } finally {
      setTestLoading(false);
    }
  };

  const openEditModal = (prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      system_prompt: prompt.system_prompt,
      tone: prompt.tone,
      is_test: prompt.is_test,
    });
    setError('');
    setShowModal(true);
  };

  const openTestModal = (prompt) => {
    setTestPrompt(prompt);
    setTestMessage('');
    setTestResponse('');
    setShowTestModal(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cấu hình Prompt AI</h1>
          <p className="text-gray-600 mt-2">Quản lý cấu hình prompt cho chatbot</p>
        </div>
        <button
          onClick={() => {
            setEditingPrompt(null);
            setFormData({ name: '', system_prompt: '', tone: 'professional', is_test: false });
            setError('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tạo Prompt Mới
        </button>
      </div>

      {activateError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {activateError}
        </div>
      )}
      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
              prompt.is_active ? 'border-green-500' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{prompt.name}</h3>
                  {prompt.is_active && (
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                      Đang hoạt động
                    </span>
                  )}
                  {prompt.is_test && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">
                      Test
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">Ngữ điệu: {prompt.tone}</p>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {prompt.system_prompt.substring(0, 200)}...
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Tạo bởi: {prompt.accounts?.full_name || 'Unknown'} • {new Date(prompt.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openTestModal(prompt)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Test"
                >
                  <Play size={20} />
                </button>
                <button
                  onClick={() => openEditModal(prompt)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sửa"
                >
                  <Edit size={20} />
                </button>
                {prompt.is_active ? (
                  <button
                    onClick={() => handleDeactivate(prompt.id)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Dừng hoạt động"
                  >
                    <X size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(prompt.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Kích hoạt"
                  >
                    <Check size={20} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(prompt.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal tạo/sửa prompt */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPrompt ? 'Sửa Prompt' : 'Tạo Prompt Mới'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngữ điệu</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="professional">Chuyên nghiệp</option>
                  <option value="friendly">Thân thiện</option>
                  <option value="casual">Thân mật</option>
                  <option value="formal">Trang trọng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">System Prompt</label>
                <textarea
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_test"
                  checked={formData.is_test}
                  onChange={(e) => setFormData({ ...formData, is_test: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_test" className="text-sm text-gray-700">
                  Chỉ dùng để test (không kích hoạt)
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingPrompt ? 'Cập nhật' : 'Tạo'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPrompt(null);
                    setFormData({ name: '', system_prompt: '', tone: 'professional', is_test: false });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal test prompt */}
      {showTestModal && testPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Test Prompt: {testPrompt.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tin nhắn test</label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tin nhắn để test..."
                />
              </div>
              <button
                onClick={handleTest}
                disabled={testLoading || !testMessage}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300"
              >
                <Play size={20} />
                {testLoading ? 'Đang test...' : 'Chạy Test'}
              </button>
              {testResponse && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kết quả</label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{testResponse}</pre>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowTestModal(false)}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
