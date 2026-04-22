import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const { id } = await params;
  const tour = await prisma.tours.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!tour) {
    return Response.json({ error: "Tour không tồn tại" }, { status: 404 });
  }
  
  return Response.json(tour);
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  await prisma.tours.update({
    where: { id: parseInt(id) },
    data: { is_deleted: true }
  });
  return Response.json({ message: "Đã xóa tour!" });
}

export async function PATCH(req, { params }) {
  const body = await req.json();
  const { id } = await params;
  const updated = await prisma.tours.update({
    where: { id: parseInt(id) },
    data: body
  });
  return Response.json(updated);
}