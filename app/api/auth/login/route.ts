import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const user = await prisma.accounts.findFirst({
      where: { username, password, is_deleted: false }
    });

    if (!user) {
      return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu!" }, { status: 401 });
    }

    // Ghi nhớ phiên đăng nhập vào Cookie (hết hạn sau 1 ngày)
    const cookieStore = await cookies();
    cookieStore.set('user_role', user.role_id.toString(), { maxAge: 86400 });
    cookieStore.set('user_name', user.full_name, { maxAge: 86400 });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.full_name, role: user.role_id } 
    });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống!" }, { status: 500 });
  }
}