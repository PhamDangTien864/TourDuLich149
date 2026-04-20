import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. Kiêm tra token trong cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    let debugInfo: {
      hasToken: boolean;
      tokenPreview: string | null;
      decodedToken: any;
      dbUser: any;
      error: string | null;
    } = {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      decodedToken: null,
      dbUser: null,
      error: null
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
