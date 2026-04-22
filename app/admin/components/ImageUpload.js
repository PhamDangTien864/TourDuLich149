'use client';
import { useState } from 'react';
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from 'next/image';

export default function ImageUpload({ onUploadSuccess, initialImage }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(initialImage || "");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        setPreview(data.url);
        onUploadSuccess(data.url); // Gửi link ảnh về Form chính
      }
    } catch (error) {
      alert("Lỗi tải ảnh!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Hình ảnh Tour</label>
      
      <div className="relative w-full h-64 border-4 border-dashed border-slate-100 rounded-[40px] flex items-center justify-center overflow-hidden bg-slate-50 group transition-all hover:border-blue-200">
        {preview ? (
          <>
            <Image src={preview} alt="Preview" className="w-full h-full object-cover" fill sizes="(max-width: 640px)" />
            <button 
              onClick={() => { setPreview(""); onUploadSuccess(""); }}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center cursor-pointer">
            {loading ? (
              <Loader2 className="animate-spin text-blue-600" size={40} />
            ) : (
              <>
                <div className="bg-blue-50 p-5 rounded-3xl text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ImagePlus size={32} />
                </div>
                <span className="text-slate-400 font-bold text-sm">Nhấn để tải ảnh lên</span>
              </>
            )}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
        )}
      </div>
    </div>
  );
}