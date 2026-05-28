'use client';
import { useState } from 'react';
import { X, Link } from "lucide-react";
import Image from 'next/image';

export default function ImageUpload({ onUploadSuccess, initialImage }) {
  const [preview, setPreview] = useState(initialImage || "");
  const [imageUrl, setImageUrl] = useState(initialImage || "");

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreview(url);
    onUploadSuccess(url);
  };

  const handleClear = () => {
    setPreview("");
    setImageUrl("");
    onUploadSuccess("");
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Hình ảnh Tour</label>
      
      <div className="relative w-full h-64 border-4 border-dashed border-slate-100 rounded-[40px] flex items-center justify-center overflow-hidden bg-slate-50 group transition-all hover:border-blue-200">
        {preview ? (
          <>
            <Image src={preview} alt="Preview" className="w-full h-full object-cover" fill sizes="(max-width: 640px)" />
            <button 
              onClick={handleClear}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center p-6 w-full">
            <div className="bg-blue-50 p-5 rounded-3xl text-blue-600 mb-3">
              <Link size={32} />
            </div>
            <span className="text-slate-400 font-bold text-sm mb-3">Nhập URL ảnh từ Google</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600">URL ảnh</label>
        <input
          type="url"
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
        />
        <p className="text-xs text-slate-400">Nhập URL ảnh từ Google Drive, Google Photos, hoặc bất kỳ nguồn nào khác</p>
      </div>
    </div>
  );
}