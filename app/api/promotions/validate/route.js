import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, tourId, price } = body;

    if (!code || !tourId || !price) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    // Find the promotion
    const promotion = await prisma.promotions.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promotion) {
      return NextResponse.json({ error: 'Mã khuyến mãi không tồn tại' }, { status: 404 });
    }

    // Check if promotion is active
    if (!promotion.is_active) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã hết hiệu lực' }, { status: 400 });
    }

    // Check if promotion is within valid date range
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    if (now < startDate || now > endDate) {
      return NextResponse.json({ error: 'Mã khuyến mãi không còn hiệu lực' }, { status: 400 });
    }

    // Check if promotion applies to this tour's category
    if (promotion.category_name) {
      const tour = await prisma.tours.findUnique({
        where: { id: Number(tourId) },
        include: { tour_categories: true }
      });

      if (!tour) {
        return NextResponse.json({ error: 'Tour không tồn tại' }, { status: 404 });
      }

      if (tour.tour_categories?.category_name !== promotion.category_name) {
        return NextResponse.json({ error: 'Mã khuyến mãi không áp dụng cho loại tour này' }, { status: 400 });
      }
    }

    // Check minimum amount
    if (promotion.min_amount > 0 && Number(price) < Number(promotion.min_amount)) {
      return NextResponse.json({ 
        error: `Giá trị đơn hàng tối thiểu là ${Number(promotion.min_amount).toLocaleString()}đ` 
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discount_type === 'percentage') {
      discountAmount = (Number(price) * Number(promotion.discount_value)) / 100;
    } else {
      discountAmount = Number(promotion.discount_value);
    }

    const finalPrice = Math.max(0, Number(price) - discountAmount);

    return NextResponse.json({
      valid: true,
      promotion: {
        code: promotion.code,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        discount_amount: discountAmount,
        final_price: finalPrice
      }
    });

  } catch (error) {
    console.error('Error validating promotion:', error);
    return NextResponse.json({ error: 'Lỗi khi kiểm tra mã khuyến mãi' }, { status: 500 });
  }
}
