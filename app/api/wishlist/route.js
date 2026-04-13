import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const decoded = verifyToken(token);

  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.wishlist.findMany({
    where: { account_id: decoded.id },
    include: { tour: true }
  });

  return NextResponse.json({ success: true, wishlist: items });
}