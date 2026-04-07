import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tours = await prisma.tours.findMany({ where: { is_deleted: false } });
  return Response.json(tours);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tour = await prisma.tours.create({
    data: {
      title: body.title,
      location_name: body.location,
      price: BigInt(body.price),
      category_id: parseInt(body.categoryId),
      description: body.description,
      is_active: true
    }
  });
  return Response.json({ success: true, tour: { ...tour, price: tour.price.toString() } });
}