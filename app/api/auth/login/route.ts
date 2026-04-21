import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { comparePassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Login API called with body:', body);
    
    // 1. Validate du lieu dau vao
    const validatedData = loginSchema.parse(body);
    const { username, password } = validatedData;
    console.log('Validated data:', { username, password: '***' });

    // 2. Tim user trong bang accounts
    const user = await prisma.accounts.findFirst({
      where: { 
        username: username,
        is_deleted: false 
      }
    });

    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        is_verified: user.is_verified,
        role_id: user.role_id 
      });
    }

    if (!user) {
      console.log('ERROR: User not found for username:', username);
      return NextResponse.json({ 
        error: "Sai tài khoản hoặc mật khẩu!" 
      }, { status: 401 });
    }

    // 3. Kiem tra mat khau
    const isPasswordValid = await comparePassword(password, user.password);
    console.log('Password validation:', isPasswordValid ? 'SUCCESS' : 'FAILED');

    if (!isPasswordValid) {
      console.log('ERROR: Invalid password for username:', username);
      return NextResponse.json({ 
        error: "Sai tài khoản hoặc mật khẩu!" 
      }, { status: 401 });
    }

    // 4. KIEM TRA XAC THUC (is_verified)
    if (!user.is_verified) {
      return NextResponse.json({ 
        error: "Tai khoan chua kich hoat!" 
      }, { status: 403 });
    }

    // 5. TAO TOKEN
    const token = generateToken({ 
      id: user.id, 
      name: user.full_name, 
      role: user.role_id, 
      is_verified: user.is_verified 
    });

    // 6. Luu Token vao Cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, { 
      maxAge: 86400, // 1 ngay
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
        role: user.role_id, 
        is_verified: user.is_verified
      },
      clientToken: token 
    });

  } catch (error: unknown) {
    console.error("LOGIN_ERROR:", error);
    // Neu loi do Zod
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: "Dinh dang tai khoan/mat khau chua dung chuan!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Loi he thong (500)" }, { status: 500 });
  }
}
