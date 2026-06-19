import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy document theo ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await prisma.knowledgeDocument.findUnique({
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

    if (!document) {
      return NextResponse.json(
        { error: 'Không tìm thấy document' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Lỗi lấy document:', error);
    return NextResponse.json(
      { error: 'Không thể lấy document' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật document
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, is_active } = body;

    const document = await prisma.knowledgeDocument.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Lỗi cập nhật document:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật document' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa document
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.knowledgeDocument.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Đã xóa document' });
  } catch (error) {
    console.error('Lỗi xóa document:', error);
    return NextResponse.json(
      { error: 'Không thể xóa document' },
      { status: 500 }
    );
  }
}
