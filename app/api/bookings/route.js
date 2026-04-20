import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { tourId, amount, customerName, phone, email } = body;

    if (!tourId || !amount || !customerName || !phone) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Tạo customer mới hoặc tìm customer existing
    let customer = await prisma.customers.findFirst({
      where: { phone_number: phone, is_deleted: false }
    });

    if (!customer) {
      customer = await prisma.customers.create({
        data: {
          full_name: customerName,
          phone_number: phone,
          email: email || null,
          is_male: true, 
          is_deleted: false
        }
      });
    } else {
      await prisma.customers.update({
        where: { id: customer.id },
        data: { 
          full_name: customerName,
          ...(email && { email: email })
        }
      });
    }

    // Tạo booking
    const booking = await prisma.bookings.create({
      data: {
        customer_id: customer.id,
        tour_id: parseInt(tourId),
        account_id: 1, 
        start_date: new Date(), 
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
        total_amount: BigInt(amount),
        paid_amount: BigInt(0),
        is_confirmed: false
      },
      include: {
        customer: true,
        tour: {
          select: {
            title: true,
            location_name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        customerName: booking.customer.full_name,
        phone: booking.customer.phone_number,
        email: booking.customer.email,
        tourTitle: booking.tour.title,
        location: booking.tour.location_name,
        amount: Number(booking.total_amount),
        startDate: booking.start_date,
        endDate: booking.end_date
      }
    });

  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "Thiếu user_id" },
        { status: 400 }
      );
    }

    const bookings = await prisma.bookings.findMany({
      where: {
        account_id: parseInt(userId)
      },
      include: {
        customer: {
          select: {
            full_name: true,
            phone_number: true
          }
        },
        tours: {
          select: {
            title: true,
            location_name: true,
            sub_title: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking.id,
        customerName: booking.customer.full_name,
        phone: booking.customer.phone_number,
        tourTitle: booking.tours.title,
        location: booking.tours.location_name,
        tourImage: booking.tours.sub_title,
        amount: Number(booking.total_amount),
        paidAmount: Number(booking.paid_amount),
        startDate: booking.start_date,
        endDate: booking.end_date,
        isConfirmed: booking.is_confirmed
      }))
    });

  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}