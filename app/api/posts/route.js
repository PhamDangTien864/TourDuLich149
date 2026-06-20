import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from '@/lib/middleware';

export async function GET() {
  try {
    console.log('POSTS API: Fetching posts');
    const posts = await prisma.posts.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      include: {
        accounts: {
          select: {
            id: true,
            full_name: true
          }
        }
      }
    });
    console.log('POSTS API: Found', posts.length, 'posts');
    return NextResponse.json(posts);
  } catch (error) {
    console.error('POSTS API: Error fetching posts:', error);
    return NextResponse.json({ error: 'Error fetching posts', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  return requireRole([1])(async (req) => {
    try {
      const body = await req.json();
      const { title, excerpt, content, category, image_url, is_active, account_id } = body;

      const post = await prisma.posts.create({
        data: {
          title,
          excerpt,
          content,
          category,
          image_url,
          is_active: is_active !== undefined ? is_active : true,
          account_id: account_id || req.user.id
        }
      });

      return NextResponse.json({ success: true, post });
    } catch (error) {
      console.error('POSTS API: Error creating post:', error);
      return NextResponse.json({ error: 'Error creating post', details: error.message }, { status: 500 });
    }
  })(request);
}
