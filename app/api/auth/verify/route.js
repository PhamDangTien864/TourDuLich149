import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Thiếu ID xác thực", { status: 400 });
  }

  try {
    // 1. Cập nhật trạng thái Verified trong DB
    await prisma.accounts.update({
      where: { id: parseInt(id) },
      data: { is_verified: true }
    });
  } catch (error) {
    // Chỉ bắt lỗi nếu UPDATE thất bại
    console.error("Verify Error:", error);
    return new Response("Lỗi xác thực hoặc tài khoản không tồn tại", { status: 500 });
  }

  // 2. LƯU Ý QUAN TRỌNG: Phải để redirect ở ngoài try-catch 
  // để Next.js thực hiện việc chuyển hướng mà không bị catch tóm mất
  redirect("/login?verified=true");
}