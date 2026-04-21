import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Kiêm tra token trong cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    let debugInfo = {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      decodedToken: null as { id?: number; username?: string; role_id?: number } | null,
      dbUser: null as {
        id?: number;
        username?: string;
        full_name?: string;
        role_id?: number;
        is_verified?: boolean;
        is_deleted?: boolean;
      } | null,
      error: null as string | null
    };

    // 2. Giai ma token
    if (token) {
      try {
        const decoded = verifyToken(token);
        debugInfo.decodedToken = decoded;
        
        // 3. Kiêm tra user trong database
        if (decoded && decoded.id) {
          const dbUser = await prisma.accounts.findUnique({
            where: { id: decoded.id },
            select: {
              id: true,
              username: true,
              full_name: true,
              role_id: true,
              is_verified: true,
              is_deleted: true
            }
          });
          debugInfo.dbUser = dbUser;
        }
      } catch (tokenError) {
        debugInfo.error = `Token verification failed: ${tokenError}`;
      }
    }

    return NextResponse.json(debugInfo);

  } catch (error) {
    return NextResponse.json({
      error: `Debug API error: ${error}`,
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}
