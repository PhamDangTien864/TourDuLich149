import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    await prisma.accounts.update({
      where: { id: parseInt(id) },
      data: { is_deleted: false } // Kích hoạt tài khoản
    });
  }
  redirect("/login?verified=true");
}