import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";
import BookingsClient from "./BookingsClient";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function ManageBookings({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "";
  const paymentStatus = params.paymentStatus || "";
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";
  const sortBy = params.sortBy || "date";
  const sortOrder = params.sortOrder || "desc";
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    ...(query && {
      OR: [
        { customers: { full_name: { contains: query } } },
        { tours: { title: { contains: query } } },
        { customers: { phone_number: { contains: query } } },
        { customers: { email: { contains: query } } }
      ]
    }),
    ...(status && { status }),
    ...(paymentStatus && {
      booking_payments: { some: { payment_status: paymentStatus } }
    }),
    ...(startDate && { start_date: { gte: new Date(startDate) } }),
    ...(endDate && { end_date: { lte: new Date(endDate) } })
  };

  // Build order clause
  const orderBy = {};
  if (sortBy === 'date') {
    orderBy.start_date = sortOrder;
  } else if (sortBy === 'amount') {
    orderBy.total_amount = sortOrder;
  } else if (sortBy === 'passengers') {
    orderBy.total_passengers = sortOrder;
  } else {
    orderBy.id = sortOrder;
  }

  const cacheKey = `admin_bookings:${JSON.stringify({ query, status, paymentStatus, startDate, endDate, sortBy, sortOrder, page, limit })}`;
  
  // Tích hợp fix rỗng || [] để không bao giờ bị dính "null is not iterable" nữa
  let [bookings, totalCount, statusCounts] = cache.get(cacheKey) || [];
  
  if (!bookings) {
    [bookings, totalCount, statusCounts] = await Promise.all([
      prisma.bookings.findMany({
        where,
        include: {
          customers: { select: { full_name: true, phone_number: true, email: true } },
          tours: { select: { title: true, location_name: true } },
          accounts: { select: { full_name: true } },
          booking_payments: { orderBy: { created_at: 'desc' }, take: 1 }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.bookings.count({ where }),
      prisma.bookings.groupBy({ by: ['status'], _count: { id: true } })
    ]);
    
    cache.set(cacheKey, [bookings, totalCount, statusCounts], 120);
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <BookingsClient 
      bookings={bookings} 
      totalCount={totalCount} 
      statusCounts={statusCounts} 
      searchParams={{ query, status, paymentStatus, startDate, endDate, sortBy, sortOrder, page, limit, skip, totalPages }} 
    />
  );
}