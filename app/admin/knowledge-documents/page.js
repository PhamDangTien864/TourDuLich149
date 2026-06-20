'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, FileText, Search, Upload, Eye, EyeOff } from 'lucide-react';

export default function KnowledgeDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    file: null,
  });
  const [error, setError] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/knowledge-documents');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error('Lỗi tải danh sách documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingDocument
        ? `/api/admin/knowledge-documents/${editingDocument.id}`
        : '/api/admin/knowledge-documents';
      const method = editingDocument ? 'PUT' : 'POST';

      let body;
      let headers = {};

      if (editingDocument) {
        // Khi sửa, gửi JSON
        body = JSON.stringify({
          title: formData.title,
          content: formData.content,
        });
        headers = { 'Content-Type': 'application/json' };
      } else {
        // Khi tạo mới, gửi FormData
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('content', formData.content);
        if (formData.file) {
          formDataObj.append('file', formData.file);
        }
        body = formDataObj;
      }

      const res = await fetch(url, {
        method,
        headers,
        body,
      });

      if (res.ok) {
        setShowModal(false);
        setEditingDocument(null);
        setFormData({ title: '', content: '', file: null });
        fetchDocuments();
      } else {
        const data = await res.json();
        setError(data.error || 'Không thể lưu document');
      }
    } catch (error) {
      console.error('Lỗi lưu document:', error);
      setError('Lỗi kết nối server');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa document này?')) return;
    try {
      const res = await fetch(`/api/admin/knowledge-documents/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Lỗi xóa document:', error);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const res = await fetch(`/api/admin/knowledge-documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Lỗi toggle active:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge-documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const openEditModal = (document) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      content: document.content,
      file: null,
    });
    setShowModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Knowledge Base</h1>
          <p className="text-gray-600 mt-2">Tải lên và quản lý tài liệu cho RAG</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Search size={20} />
            Tìm kiếm
          </button>
          <button
            onClick={() => {
              setEditingDocument(null);
              setFormData({ title: '', content: '', file: null });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={20} />
            Tải lên Document
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
              doc.is_active ? 'border-green-500' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={24} className="text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">{doc.title}</h3>
                  {doc.is_active ? (
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-semibold">
                      Không hoạt động
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-2">
                  {doc.file_name || 'Text content'} • {doc.chunk_count} chunks
                </p>
                <p className="text-gray-400 text-xs line-clamp-2">
                  {doc.content.substring(0, 200)}...
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Tải lên bởi: {doc.accounts?.full_name || 'Unknown'} • {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(doc.id, doc.is_active)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title={doc.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                >
                  {doc.is_active ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button
                  onClick={() => openEditModal(doc)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sửa"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
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

      {/* Modal tải lên/sửa document */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingDocument ? 'Sửa Document' : 'Tải lên Document Mới'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {!editingDocument && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tải file (TXT, DOCX, MD)</label>
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    accept=".txt,.docx,.md"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Hoặc nhập nội dung bên dưới. PDF không được hỗ trợ, vui lòng copy nội dung từ PDF.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung {formData.file ? '(tùy chọn - sẽ lấy từ file)' : ''}</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!formData.file}
                  disabled={!!formData.file}
                  placeholder={formData.file ? 'Nội dung sẽ được lấy từ file upload' : 'Nhập nội dung tài liệu...'}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  {editingDocument ? 'Cập nhật' : 'Tải lên'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDocument(null);
                    setFormData({ title: '', content: '', file: null });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal tìm kiếm */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Tìm kiếm trong Knowledge Base</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập câu hỏi để tìm kiếm..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:bg-gray-300"
                >
                  <Search size={20} />
                  {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Kết quả:</h3>
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{result.title}</h4>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {result.similarity.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{result.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
