import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.accounts.findFirst({
      where: { 
        id: userId,
        is_deleted: false 
      },
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        email: true,
        birth_date: true,
        username: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
