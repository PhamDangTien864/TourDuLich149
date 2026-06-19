import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { system_prompt, message, history } = await req.json();

    if (!system_prompt || !message) {
      return NextResponse.json(
        { error: 'System prompt và message là bắt buộc' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: system_prompt,
    });

    let cleanHistory = history || [];
    if (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
      cleanHistory = cleanHistory.slice(1);
    }

    const chatSession = model.startChat({
      history: cleanHistory,
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error('Lỗi test prompt:', error);
    return NextResponse.json(
      { error: 'Không thể test prompt' },
      { status: 500 }
    );
  }
}
