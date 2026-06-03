import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware";

export async function GET(req, { params }) {
  return requireRole([1])(async (request) => {
    const { id } = await params;
    const tour = await prisma.tours.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!tour) {
      return Response.json({ error: "Tour không tồn tại" }, { status: 404 });
    }
    
    return Response.json(tour);
  })(req);
}

export async function DELETE(req, { params }) {
  return requireRole([1])(async (request) => {
    const { id } = await params;
    await prisma.tours.update({
      where: { id: parseInt(id) },
      data: { is_deleted: true }
    });
    return Response.json({ message: "Đã xóa tour!" });
  })(req);
}

export async function PATCH(req, { params }) {
  return requireRole([1])(async (request) => {
    const body = await req.json();
    const { id } = await params;
    const updated = await prisma.tours.update({
      where: { id: parseInt(id) },
      data: body
    });
    return Response.json(updated);
  })(req);
}