import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "Hãy chọn ảnh!" }, { status: 400 });
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Kích thước file tối đa 5MB" }, { status: 400 });
    }

    // Chuyển file sang dạng Buffer để Cloudinary hiểu
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Đẩy ảnh lên Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ 
        folder: "viettravel_tours",
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    // Trả về link ảnh đã upload thành công
    return NextResponse.json({ url: uploadResponse.secure_url });

  } catch {
    return NextResponse.json({ error: "Lỗi upload!" }, { status: 500 });
  }
}