import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, full_name, email, phone_number, password, role_id } = body;

    if (!username || !full_name || !email || !phone_number || !password) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
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

    const user = await prisma.accounts.create({
      data: {
        username,
        full_name,
        email,
        phone_number,
        password, // Note: In production, this should be hashed
        role_id: parseInt(role_id) || 2, // Default to customer
        is_verified: true, // Admin-created users are auto-verified
        is_deleted: false
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        role_id: user.role_id
      }
    });

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}
