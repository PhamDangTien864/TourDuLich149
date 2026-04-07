import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(req) {
  try {
    const { email, username, password, full_name, phone } = await req.json();

    // 1. Tạo tài khoản tạm thời
    const user = await prisma.accounts.create({
      data: {
        full_name,
        username, // Dùng email làm username cho tiện xác thực
        password, // Ní nhớ dùng bcrypt mã hóa nếu có thời gian nhé
        phone_number: phone,
        role_id: 2,
        is_deleted: true, // Coi như chưa xác thực
      }
    });

    // 2. Gửi mail xác thực
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?id=${user.id}`;
    
    await resend.emails.send({
      from: 'VietTravel <onboarding@resend.dev>',
      to: email,
      subject: 'Xác thực tài khoản VietTravel của ní',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>Chào ${full_name}!</h1>
          <p>Cảm ơn ní đã chọn VietTravel. Nhấn vào nút dưới đây để kích hoạt tài khoản nhé:</p>
          <a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold;">Kích hoạt ngay</a>
        </div>
      `
    });

    return Response.json({ success: true, message: "Kiểm tra mail nhé ní!" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}