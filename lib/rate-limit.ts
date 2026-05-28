// Simple in-memory rate limiter
// In production, use Redis or a dedicated rate limiting service for distributed systems
// To upgrade to Redis:
// 1. Install: npm install ioredis
// 2. Replace Map with Redis client
// 3. Use Redis INCR/EXPIRE for atomic operations
// Current implementation is suitable for single-server development/testing

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

export function rateLimit({
  windowMs = 15 * 60 * 1000, // 15 minutes
  maxRequests = 100,
  identifier = 'ip'
}: {
  windowMs?: number;
  maxRequests?: number;
  identifier?: 'ip' | 'user';
} = {}) {
  return async (req: Request): Promise<{ success: boolean; remaining: number; resetTime: number }> => {
    // Get identifier
    let key: string;
    if (identifier === 'user') {
      // Try to get user ID from token
      const token = req.headers.get('authorization')?.replace('Bearer ', '');
      if (token) {
        key = `user:${token}`;
      } else {
        key = `ip:${req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'}`;
      }
    } else {
      key = `ip:${req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'}`;
    }

    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return {
        success: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      };
    }

    if (record.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    return {
      success: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime
    };
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute
