import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { admin_reply } = body;

    const review = await prisma.reviews.update({
      where: { id: Number(id) },
      data: { admin_reply }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error adding admin reply:', error);
    return NextResponse.json({ error: 'Error adding admin reply' }, { status: 500 });
  }
}
