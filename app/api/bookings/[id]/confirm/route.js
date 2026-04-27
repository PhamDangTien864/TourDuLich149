import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { confirm } = body;

    const booking = await prisma.bookings.update({
      where: { id: parseInt(id) },
      data: { is_confirmed: confirm }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Confirm booking error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
