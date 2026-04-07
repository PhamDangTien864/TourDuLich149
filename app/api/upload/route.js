import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "Chưa chọn ảnh ní ơi!" }, { status: 400 });
    }

    // Chuyển file sang dạng Buffer để Cloudinary hiểu
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Đẩy ảnh lên Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "viettravel_tours" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    // Trả về link ảnh đã upload thành công
    return NextResponse.json({ url: uploadResponse.secure_url });

  } catch (error) {
    return NextResponse.json({ error: "Lỗi upload rồi ní!" }, { status: 500 });
  }
}