import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy prompt configuration theo ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prompt = await prisma.promptConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        accounts: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Không tìm thấy prompt config' },
        { status: 404 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Lỗi lấy prompt config:', error);
    return NextResponse.json(
      { error: 'Không thể lấy prompt config' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật prompt configuration
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, system_prompt, tone, is_active, is_test } = body;

    // Nếu set active và không phải test, deactivate tất cả prompt active khác
    if (is_active && !is_test) {
      await prisma.promptConfig.updateMany({
        where: {
          is_active: true,
          id: { not: parseInt(id) },
        },
        data: { is_active: false },
      });
    }

    const prompt = await prisma.promptConfig.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(system_prompt && { system_prompt }),
        ...(tone && { tone }),
        ...(is_active !== undefined && { is_active }),
        ...(is_test !== undefined && { is_test }),
      },
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Lỗi cập nhật prompt config:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật prompt config' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa prompt configuration
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.promptConfig.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Đã xóa prompt config' });
  } catch (error) {
    console.error('Lỗi xóa prompt config:', error);
    return NextResponse.json(
      { error: 'Không thể xóa prompt config' },
      { status: 500 }
    );
  }
}
