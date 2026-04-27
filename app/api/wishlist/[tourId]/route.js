import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE(req, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const decoded = verifyToken(token);

  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tourId } = await params;

  await prisma.wishlist.deleteMany({
    where: {
      account_id: decoded.id,
      tour_id: parseInt(tourId)
    }
  });

  return NextResponse.json({ success: true });
}
