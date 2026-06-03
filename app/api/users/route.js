import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    // Authenticate user - chỉ admin mới có thể tạo user
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is admin (role_id = 1)
    if (user.role_id !== 1) {
      return NextResponse.json({ error: 'Chỉ admin mới có thể tạo user' }, { status: 403 });
    }

    const body = await req.json();
    const { username, full_name, email, phone_number, password, role_id } = body;

    if (!username || !full_name || !email || !phone_number || !password) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 8 ký tự" },
        { status: 400 }
      );
    }

    // Check password complexity (uppercase, lowercase, number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Mật khẩu phải có chữ hoa, chữ thường và số" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.accounts.findFirst({
      where: { username, is_deleted: false }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Tên đăng nhập đã tồn tại" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.accounts.findFirst({
      where: { email, is_deleted: false }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role_id - chỉ admin mới có thể tạo admin
    const requestedRoleId = parseInt(role_id) || 2;
    if (requestedRoleId === 1 && user.role_id !== 1) {
      return NextResponse.json(
        { error: "Không có quyền tạo admin" },
        { status: 403 }
      );
    }

    const newUser = await prisma.accounts.create({
      data: {
        username,
        full_name,
        email,
        phone_number,
        password: hashedPassword,
        role_id: requestedRoleId,
        is_verified: true,
        is_deleted: false
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        full_name: newUser.full_name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        role_id: newUser.role_id
      }
    });

  } catch {
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}
