import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const promotions = await prisma.promotions.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(promotions);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching promotions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, discount_type, discount_value, min_amount, start_date, end_date, description, category_name, is_active } = body;

    // Check if code already exists
    const existing = await prisma.promotions.findUnique({
      where: { code }
    });

    if (existing) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã tồn tại' }, { status: 400 });
    }

    const promotion = await prisma.promotions.create({
      data: {
        code,
        discount_type,
        discount_value: discount_value,
        min_amount: min_amount || 0,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        description,
        category_name: category_name || null,
        is_active: is_active !== undefined ? is_active : true
      }
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ error: 'Error creating promotion' }, { status: 500 });
  }
}
