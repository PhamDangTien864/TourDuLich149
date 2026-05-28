import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';

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

/**
 * Authenticate user from request
 * Extracts token from cookie or Authorization header, verifies it, and fetches user from database
 * @param request - NextRequest object
 * @returns User object if authenticated, null otherwise
 */
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

  if (!user) return null;

  // Ensure role_id is always a number (default to 2 if null)
  return {
    ...user,
    role_id: user.role_id ?? 2
  };
}

/**
 * Require authentication middleware
 * Wraps a handler to require authentication
 * @param handler - The handler function to wrap
 * @returns Wrapped handler that requires authentication
 */
export function requireAuth(handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const user = await authenticate(request);
    
    if (!user) {
      return unauthorizedResponse();
    }

    // Attach authenticated user to request
    request.user = user;
    
    return handler(request, ...args);
  };
}

/**
 * Require specific role middleware
 * Wraps a handler to require specific role(s)
 * @param allowedRoles - Array of role IDs that are allowed
 * @returns Wrapped handler that requires specific role
 */
export function requireRole(allowedRoles: number[]) {
  return (handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) => {
    return async (request: NextRequest, ...args: unknown[]) => {
      const user = await authenticate(request);
      
      if (!user) {
        return unauthorizedResponse();
      }

      // Check if user has required role
      if (!allowedRoles.includes(user.role_id)) {
        return forbiddenResponse();
      }

      request.user = user;
      
      return handler(request, ...args);
    };
  };
}

/**
 * Optional authentication middleware
 * Attaches user to request if authenticated, but doesn't require it
 * @param handler - The handler function to wrap
 * @returns Wrapped handler with optional authentication
 */
export function withOptionalAuth(handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const user = await authenticate(request);
    
    if (user) {
      request.user = user;
    }
    
    return handler(request, ...args);
  };
}