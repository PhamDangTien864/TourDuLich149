import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const { id } = params;
  await prisma.tours.update({
    where: { id: parseInt(id) },
    data: { is_deleted: true }
  });
  return Response.json({ message: "Đã xóa tour!" });
}

export async function PATCH(req, { params }) {
  const body = await req.json();
  const updated = await prisma.tours.update({
    where: { id: parseInt(params.id) },
    data: body
  });
  return Response.json(updated);
}