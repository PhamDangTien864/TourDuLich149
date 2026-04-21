import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Extend NextRequest interface to include user property
declare global {
  interface ProcessEnv {
    JWT_SECRET?: string;
    NEXT_PUBLIC_BASE_URL?: string;
  }
}

declare module 'next/server' {
  interface NextRequest {
    user?: {
      id: number;
      full_name: string;
      username: string;
      role_id: number;
      phone_number: string;
    };
  }
}

export async function authenticate(request: NextRequest) {
  // Get token from cookie or Authorization header
  const token = request.cookies.get('auth_token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  // Verify JWT token
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  // Get user from database
  const user = await prisma.accounts.findFirst({
    where: { 
      id: decoded.id, 
      is_deleted: false 
    },
    select: {
      id: true,
      full_name: true,
      username: true,
      role_id: true,
      phone_number: true
    }
  });

  return user;
}

export function requireAuth(handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Add user to request context
    request.user = user;
    
    return handler(request, ...args);
  };
}

export function requireRole(allowedRoles: number[]) {
  return (handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) => {
    return async (request: NextRequest, ...args: unknown[]) => {
      const user = await authenticate(request);
      
      if (!user) {
        return NextResponse.json({ 
          error: 'Authentication required' 
        }, { status: 401 });
      }

      if (!allowedRoles.includes(user.role_id)) {
        return NextResponse.json({ 
          error: 'Insufficient permissions' 
        }, { status: 403 });
      }

      request.user = user;
      
      return handler(request, ...args);
    };
  };
}
