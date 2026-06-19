import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy chat analytics (câu hỏi thường gặp)
export async function GET() {
  try {
    const analytics = await prisma.chatAnalytics.findMany({
      orderBy: [{ question_count: 'desc' }, { last_asked: 'desc' }],
      take: 50,
    });
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Lỗi lấy chat analytics:', error);
    return NextResponse.json(
      { error: 'Không thể lấy chat analytics' },
      { status: 500 }
    );
  }
}

// POST - Cập nhật hoặc tạo analytics cho câu hỏi
export async function POST(req: Request) {
  try {
    const { question, answer, satisfaction_score } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Câu hỏi và câu trả lời là bắt buộc' },
        { status: 400 }
      );
    }

    // Normalize question (lowercase, trim)
    const normalizedQuestion = question.toLowerCase().trim();

    // Check if question already exists
    const existing = await prisma.chatAnalytics.findFirst({
      where: { question: normalizedQuestion },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.chatAnalytics.update({
        where: { id: existing.id },
        data: {
          question_count: existing.question_count + 1,
          last_asked: new Date(),
          ...(satisfaction_score && { satisfaction_score }),
        },
      });
      return NextResponse.json(updated);
    } else {
      // Create new
      const created = await prisma.chatAnalytics.create({
        data: {
          question: normalizedQuestion,
          answer,
          question_count: 1,
          last_asked: new Date(),
          satisfaction_score,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error('Lỗi cập nhật chat analytics:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật chat analytics' },
      { status: 500 }
    );
  }
}
