import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    console.log('Register API called');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const validatedData = registerSchema.parse(body);
    const { username, email, password, full_name, phone_number, birth_date } = validatedData;
    
    console.log('Validated data:', { username, email, full_name });

    // 1. Check trùng Username hoặc Email
    const existing = await prisma.accounts.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existing) {
      const field = existing.username === username ? "Username" : "Email";
      console.log(`Conflict: ${field} already exists`);
      return NextResponse.json({ error: `${field} đã được sử dụng!` }, { status: 400 });
    }

    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);

    // 2. Tạo tài khoản
    console.log('Creating user account...');
    const user = await prisma.accounts.create({
      data: {
        full_name,
        username,
        email, 
        password: hashedPassword,
        phone_number,
        birth_date: new Date(birth_date),
        is_verified: false,
      }
    });

    console.log('User created successfully:', user.id);

    // 3. Gửi mail về Email bằng DOMAIN CHÍNH CHỦ
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?id=${user.id}`;
    console.log('Sending verification email to:', email);
    
    try {
      const emailData = {
        // CẬP NHẬT: Thay đổi từ onboarding@resend.dev sang domain luxury của ní
        from: 'VietTravel Luxury <verify@travelluxury.id.vn>',
        to: [email], 
        subject: 'Xác thực tài khoản VietTravel Luxury',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">VietTravel Luxury</h1>
            </div>
            <div style="padding: 30px; color: #333;">
              <h2 style="color: #2563eb;">Xác thực tài khoản của ní Tiến</h2>
              <p>Chào <strong>${full_name}</strong>,</p>
              <p>Cảm ơn ní đã tin tưởng và đăng ký tài khoản tại VietTravel Luxury. Vui lòng nhấn vào nút bên dưới để kích hoạt tài khoản ngay nhé:</p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Kích hoạt tài khoản
                </a>
              </div>
              <p>Nếu nút không hoạt động, ní có thể copy link này dán vào trình duyệt:</p>
              <p style="word-break: break-all;"><a href="${verifyUrl}" style="color: #2563eb;">${verifyUrl}</a></p>
              <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
              <p style="color: #6b7280; font-size: 12px; text-align: center;">
                Đây là email tự động từ hệ thống VietTravel Luxury. Nếu ní không thực hiện đăng ký, vui lòng bỏ qua email này.
              </p>
            </div>
          </div>
        `
      };
      
      const result = await resend.emails.send(emailData);
      console.log('Verification email sent successfully to:', email);
      console.log('Email send result:', result);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return NextResponse.json({ success: true, message: "Check email để xác thực nhé!" });
  } catch (error) {
    console.error('Register API error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: "Data không hợp lệ!", details: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Lỗi hệ thống!", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}