import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy tất cả prompt configurations
export async function GET() {
  try {
    const prompts = await prisma.promptConfig.findMany({
      orderBy: { created_at: 'desc' },
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
    return NextResponse.json(prompts);
  } catch (error) {Chào bạn! Rất tiếc, thông tin về sứ mệnh cụ thể của Hoa Binh Travel hiện không có trong tài liệu tôi được cung cấp.

Để biết thêm chi tiết hoặc được hỗ trợ trực tiếp, bạn vui lòng để lại số điện thoại hoặc liên hệ Hotline/Zalo hiển thị trên màn hình nhé! Hoa Binh Travel luôn sẵn lòng phục vụ bạn. 😊
    console.error('Lỗi lấy danh sách prompt config:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách prompt config' },
      { status: 500 }
    );
  }
}

// POST - Tạo prompt configuration mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, system_prompt, tone, is_test, created_by } = body;

    if (!name || !system_prompt) {
      return NextResponse.json(
        { error: 'Tên và system prompt là bắt buộc' },
        { status: 400 }
      );
    }

    // Nếu không phải test, deactivate tất cả prompt active khác
    if (!is_test) {
      await prisma.promptConfig.updateMany({
        where: { is_active: true },
        data: { is_active: false },
      });
    }

    const prompt = await prisma.promptConfig.create({
      data: {
        name,
        system_prompt,
        tone: tone || 'professional',
        is_active: !is_test,
        is_test: is_test || false,
        created_by: created_by || null,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Lỗi tạo prompt config:', error);
    return NextResponse.json(
      { error: 'Không thể tạo prompt config' },
      { status: 500 }
    );
  }
}
