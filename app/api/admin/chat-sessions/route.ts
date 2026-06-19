import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy tất cả chat sessions
export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { started_at: 'desc' },
      include: {
        accounts: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Lỗi lấy danh sách chat sessions:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách chat sessions' },
      { status: 500 }
    );
  }
}
