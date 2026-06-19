import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const prisma = new PrismaClient();

// TODO: Add rate limiting to prevent abuse of Gemini API
// Current rate-limit.ts implementation doesn't work on serverless (Vercel)
// Consider using Upstash Redis or similar for distributed rate limiting

// Helper function for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper function to search knowledge base with RAG
async function searchKnowledgeBase(query: string): Promise<string> {
  try {
    // Get all active documents
    const documents = await prisma.knowledgeDocument.findMany({
      where: { is_active: true },
    });

    console.log(`Tìm thấy ${documents.length} documents active`);

    if (documents.length === 0) {
      console.log("Không có document nào active, fallback về faq.md");
      // Fallback to faq.md if no documents in database
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "faq.md");
      try {
        return await fs.readFile(filePath, "utf8");
      } catch {
        return "";
      }
    }

    // Tạm thời: trả về nội dung của tất cả documents active (không dùng embedding)
    // Vì embedding API của Google không hoạt động
    console.log("Sử dụng phương pháp fallback: gộp nội dung tất cả documents");
    return documents.map(doc => doc.content).join("\n\n");
  } catch (error) {
    console.error("Lỗi tìm kiếm knowledge base:", error);
    return "";
  }
}

// Helper function to get active prompt configuration
async function getActivePromptConfig(): Promise<string> {
  try {
    const activeConfig = await prisma.promptConfig.findFirst({
      where: { is_active: true },
    });

    if (activeConfig) {
      return activeConfig.system_prompt;
    }

    // Fallback to default prompt
    return `Bạn là trợ lý ảo AI chuyên nghiệp của Hoa Binh Travel. Nhiệm vụ của bạn là đọc hiểu và sử dụng nguồn dữ liệu tri thức được cung cấp dưới đây để trả lời câu hỏi của khách hàng một cách ngắn gọn, thân thiện và chính xác bằng tiếng Việt.\n\nNếu thông tin khách hỏi không có trong tài liệu tri thức, hãy khéo léo từ chối và hướng dẫn họ để lại số điện thoại hoặc liên hệ Hotline/Zalo hiển thị trên màn hình để được nhân viên hỗ trợ trực tiếp.`;
  } catch (error) {
    console.error("Lỗi lấy prompt config:", error);
    return `Bạn là trợ lý ảo AI chuyên nghiệp của Hoa Binh Travel.`;
  }
}

// Helper function to track chat analytics
async function trackChatAnalytics(question: string, answer: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/admin/chat-analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
  } catch (error) {
    console.error("Lỗi track chat analytics:", error);
  }
}

// Helper function to track chat session
async function trackChatSession(sessionId: string, message: string, sender: string) {
  try {
    // Get or create session
    let session = await prisma.chatSession.findUnique({
      where: { session_id: sessionId },
    });

    if (!session) {
      try {
        session = await prisma.chatSession.create({
          data: {
            session_id: sessionId,
            started_at: new Date(),
            message_count: 0,
          },
        });
      } catch (error) {
        // Nếu session đã tồn tại (race condition), lấy lại
        console.error("Lỗi tạo session (có thể đã tồn tại):", error);
        session = await prisma.chatSession.findUnique({
          where: { session_id: sessionId },
        });
        if (!session) throw error;
      }
    }

    // Create message
    await prisma.chatMessage.create({
      data: {
        session_id: session.id,
        sender,
        message,
      },
    });

    // Update message count
    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        message_count: (session.message_count ?? 0) + 1,
        ended_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Lỗi track chat session:", error);
  }
}

export async function POST(req: Request) {
  try {
    const { message, history, sessionId } = await req.json();

    // Generate session ID if not provided
    const currentSessionId = sessionId || crypto.randomUUID();

    // Get active prompt configuration
    const systemPrompt = await getActivePromptConfig();

    // Search knowledge base with RAG
    const knowledge = await searchKnowledgeBase(message);

    // Build full system instruction
    const fullSystemInstruction = knowledge
      ? `${systemPrompt}\n\nNguồn dữ liệu tri thức:\n${knowledge}`
      : systemPrompt;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: fullSystemInstruction,
    });

    let cleanHistory = history || [];
    if (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
      cleanHistory = cleanHistory.slice(1);
    }

    const chatSession = model.startChat({
      history: cleanHistory,
    });

    const result = await chatSession.sendMessage(message);
    let responseText = result.response.text();

    // Tự động làm sạch đường dẫn tuyệt đối
    if (responseText) {
      responseText = responseText.replace(/https?:\/\/(www\.)?travelluxury\.id\.vn/g, "");
      responseText = responseText.replace(/https?:\/\/localhost:\d+/g, "");
    }

    // Track chat session (async, don't await)
    trackChatSession(currentSessionId, message, "user").catch(console.error);
    trackChatSession(currentSessionId, responseText, "bot").catch(console.error);

    // Track analytics (async, don't await)
    trackChatAnalytics(message, responseText).catch(console.error);

    return NextResponse.json({ 
      text: responseText,
      sessionId: currentSessionId,
    });

  } catch (error) {
    console.error("Lỗi nghiêm trọng tại Chatbot API Route:", error);
    return NextResponse.json(
      { text: "Dạ, hệ thống AI đang bận xử lý dữ liệu chuyến đi, bạn chờ em một xíu nhé!" },
      { status: 500 }
    );
  }
}
