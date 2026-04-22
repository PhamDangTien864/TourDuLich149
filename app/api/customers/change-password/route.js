import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword, emailVerification } = await body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin người dùng' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.accounts.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    // Method 1: Verify with current password
    if (currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mật khẩu hiện tại không đúng' },
          { status: 401 }
        );
      }
    }
    // Method 2: Verify with email
    else if (emailVerification) {
      if (emailVerification !== user.email) {
        return NextResponse.json(
          { error: 'Email không khớp với email tài khoản' },
          { status: 401 }
        );
      }
    }
    else {
      return NextResponse.json(
        { error: 'Cần xác nhận mật khẩu hiện tại hoặc email' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.accounts.update({
      where: { id: parseInt(userId) },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
