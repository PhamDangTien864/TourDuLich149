import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const posts = await prisma.$queryRaw`
      SELECT * FROM posts 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `;
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, excerpt, content, category, image_url, is_active } = body;

    const result = await prisma.$queryRaw`
      INSERT INTO posts (title, excerpt, content, category, image_url, is_active)
      VALUES (${title}, ${excerpt}, ${content}, ${category}, ${image_url}, ${is_active !== undefined ? is_active : true})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
}
