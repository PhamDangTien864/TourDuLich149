import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { comparePassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validate dữ liệu đầu vào
    const validatedData = loginSchema.parse(body);
    const { username, password } = validatedData;

    // 2. Tìm user trong bảng accounts
    const user = await prisma.accounts.findFirst({
      where: { 
        username: username,
        is_deleted: false 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Tài khoản này không tồn tại!" }, { status: 401 });
    }

    // 3. Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Mật khẩu sai!" }, { status: 401 });
    }

    // 4. KIỂM TRA XÁC THỰC (is_verified)
    // Nếu ní sửa role = 1 mà quên sửa cái này thành true là không login được đâu
    if (!user.is_verified) {
      return NextResponse.json({ 
        error: "Tài khoản chưa kích hoạt!" 
      }, { status: 403 });
    }

    // 5. TẠO TOKEN (Phải đủ 4 trường như interface trong lib/auth.ts)
    const token = generateToken({ 
      id: user.id, 
      name: user.full_name, 
      role: user.role, 
      is_verified: user.is_verified 
    });

    // 6. Lưu Token vào Cookie để Middleware (proxy.js) đọc được
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, { 
      maxAge: 86400, // 1 ngày
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.full_name, 
        role: user.role,
        is_verified: user.is_verified
      },
      clientToken: token 
    });

  } catch (error: any) {
    console.error("LOGIN_ERROR_LOG:", error);
    // Nếu lỗi do Zod (nhập liệu sai format)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: "Định dạng tài khoản/mật khẩu chưa đúng chuẩn!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi hệ thống (500)" }, { status: 500 });
  }
}