'use client';

import { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 max-w-md w-full text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-600" size={40} />
            </div>
            <h2 className="text-2xl font-black text-red-900 mb-4">Đã có lỗi xảy ra</h2>
            <p className="text-red-700 font-bold mb-6">
              {this.state.error?.message || 'Một lỗi không mong muốn đã xảy ra. Vui lòng thử lại.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 mx-auto transition-all"
            >
              <RefreshCw size={18} />
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
