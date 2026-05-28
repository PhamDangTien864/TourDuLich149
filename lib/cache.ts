// Enhanced cache utility for production use
// In production, consider using Redis or similar for distributed caching

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup of expired entries
    this.startCleanup();
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache decorator for functions
  memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number
  ): T {
    return (async (...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      // Try to get from cache first
      const cached = this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      const result = await fn(...args);
      this.set(key, result, ttl);
      
      return result;
    }) as T;
  }

  // Cache invalidation patterns
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Periodic cleanup of expired entries
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60 * 1000); // Cleanup every minute
  }

  // Stop cleanup interval
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const cache = new Cache();

// Specific cache keys for different data types
export const CACHE_KEYS = {
  TOURS: 'tours',
  TOUR_DETAIL: (id: number) => `tour:${id}`,
  USER_BOOKINGS: (userId: number) => `user_bookings:${userId}`,
  TOUR_REVIEWS: (tourId: number) => `tour_reviews:${tourId}`,
  CATEGORIES: 'categories',
  PROMOTIONS: 'promotions',
  PROVINCES: 'provinces',
  TOUR_SCHEDULES: (tourId: number) => `tour_schedules:${tourId}`,
  DEPARTURE_SCHEDULE: (id: number) => `departure_schedule:${id}`
} as const;

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000,  // 1 hour
  STATIC: 24 * 60 * 60 * 1000 // 24 hours
} as const;

// Cache invalidation helpers
export class CacheInvalidator {
  static invalidateTour(tourId: number): void {
    cache.delete(CACHE_KEYS.TOUR_DETAIL(tourId));
    cache.delete(CACHE_KEYS.TOUR_REVIEWS(tourId));
    cache.delete(CACHE_KEYS.TOUR_SCHEDULES(tourId));
    cache.invalidatePattern(CACHE_KEYS.TOURS);
  }

  static invalidateUserBookings(userId: number): void {
    cache.delete(CACHE_KEYS.USER_BOOKINGS(userId));
  }

  static invalidateDepartureSchedule(scheduleId: number): void {
    cache.delete(CACHE_KEYS.DEPARTURE_SCHEDULE(scheduleId));
    cache.invalidatePattern('tour_schedules:');
  }

  static invalidateStaticData(): void {
    cache.delete(CACHE_KEYS.CATEGORIES);
    cache.delete(CACHE_KEYS.PROVINCES);
    cache.delete(CACHE_KEYS.PROMOTIONS);
  }
}
