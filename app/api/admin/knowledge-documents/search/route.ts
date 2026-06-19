import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// POST - Tìm kiếm trong knowledge base với RAG
export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query là bắt buộc' },
        { status: 400 }
      );
    }

    // Get all active documents
    const documents = await prisma.knowledgeDocument.findMany({
      where: { is_active: true },
    });

    // Generate embedding for query
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const queryResult = await embeddingModel.embedContent(query);
    const queryEmbedding = queryResult.embedding.values;

    // Calculate similarity scores
    const results = [];
    for (const doc of documents) {
      if (!doc.embedding) continue;

      const docEmbeddings = JSON.parse(doc.embedding);
      let maxSimilarity = 0;

      for (const docEmbedding of docEmbeddings) {
        const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
        }
      }

      if (maxSimilarity > 0.5) {
        results.push({
          document: doc,
          similarity: maxSimilarity,
        });
      }
    }

    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    // Return top 5 results
    const topResults = results.slice(0, 5).map(r => ({
      id: r.document.id,
      title: r.document.title,
      content: r.document.content,
      similarity: r.similarity,
    }));

    return NextResponse.json({ results: topResults });
  } catch (error) {
    console.error('Lỗi tìm kiếm knowledge base:', error);
    return NextResponse.json(
      { error: 'Không thể tìm kiếm knowledge base' },
      { status: 500 }
    );
  }
}

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
