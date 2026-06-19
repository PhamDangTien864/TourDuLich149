import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Activate prompt configuration
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Deactivate tất cả prompt active khác
    await prisma.promptConfig.updateMany({
      where: { is_active: true },
      data: { is_active: false },
    });

    // Activate prompt được chọn
    const prompt = await prisma.promptConfig.update({
      where: { id: parseInt(id) },
      data: { is_active: true, is_test: false },
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Lỗi activate prompt config:', error);
    return NextResponse.json(
      { error: 'Không thể activate prompt config' },
      { status: 500 }
    );
  }
}
