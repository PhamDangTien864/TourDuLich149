import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy summary analytics
export async function GET() {
  try {
    const totalSessions = await prisma.chatSession.count();
    const totalMessages = await prisma.chatMessage.count();
    const totalQuestions = await prisma.chatAnalytics.count();
    const avgSatisfaction = await prisma.chatAnalytics.aggregate({
      _avg: {
        satisfaction_score: true,
      },
    });

    const topQuestions = await prisma.chatAnalytics.findMany({
      orderBy: { question_count: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      totalSessions,
      totalMessages,
      totalQuestions,
      avgSatisfaction: avgSatisfaction._avg.satisfaction_score || 0,
      topQuestions,
    });
  } catch (error) {
    console.error('Lỗi lấy summary analytics:', error);
    return NextResponse.json(
      { error: 'Không thể lấy summary analytics' },
      { status: 500 }
    );
  }
}
