import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// GET - Lấy tất cả knowledge documents
export async function GET() {
  try {
    const documents = await prisma.knowledgeDocument.findMany({
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
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Lỗi lấy danh sách documents:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách documents' },
      { status: 500 }
    );
  }
}

// POST - Upload document mới với embedding
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    let content = formData.get('content') as string;
    const file = formData.get('file') as File;
    const uploaded_by = formData.get('uploaded_by') as string;

    if (!title) {
      return NextResponse.json(
        { error: 'Tiêu đề là bắt buộc' },
        { status: 400 }
      );
    }

    // Nếu có file upload, đọc nội dung từ file
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Xử lý theo loại file
      if (file.name.endsWith('.docx')) {
        // Đọc file Word
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
      } else if (file.name.endsWith('.pdf')) {
        // PDF không hỗ trợ - yêu cầu copy nội dung
        return NextResponse.json(
          { error: 'PDF không được hỗ trợ. Vui lòng copy nội dung từ PDF vào ô nội dung.' },
          { status: 400 }
        );
      } else {
        // Đọc file text (.txt, .md)
        content = buffer.toString('utf-8');
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Nội dung là bắt buộc (cần nhập text hoặc upload file)' },
        { status: 400 }
      );
    }

    // Split content into chunks for embedding
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }

    // Generate embeddings for each chunk using Gemini
    const embeddingModel = genAI.getGenerativeModel({ model: "models/embedding-001" });
    const embeddings = [];

    for (const chunk of chunks) {
      try {
        const result = await embeddingModel.embedContent(chunk);
        embeddings.push(result.embedding.values);
      } catch (error) {
        console.error('Lỗi tạo embedding:', error);
      }
    }

    // Store embeddings as JSON string
    const embeddingString = JSON.stringify(embeddings);

    const document = await prisma.knowledgeDocument.create({
      data: {
        title,
        content,
        file_name: file?.name || null,
        file_type: file?.type ? file.type.substring(0, 50) : null,
        embedding: embeddingString,
        chunk_count: chunks.length,
        uploaded_by: uploaded_by ? parseInt(uploaded_by) : null,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Lỗi upload document:', error);
    return NextResponse.json(
      { error: 'Không thể upload document' },
      { status: 500 }
    );
  }
}
