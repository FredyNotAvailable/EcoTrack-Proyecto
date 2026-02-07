import NodeCache from 'node-cache';

/**
 * Simple in-memory cache service using node-cache
 * TTL values are in seconds
 */
class CacheService {
    private cache: NodeCache;

    constructor() {
        this.cache = new NodeCache({
            stdTTL: 300, // Default 5 minutes
            checkperiod: 60, // Check for expired keys every 60 seconds
            useClones: false // For better performance with objects
        });
    }

    /**
     * Get value from cache
     */
    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    /**
     * Set value in cache with optional TTL
     */
    set<T>(key: string, value: T, ttlSeconds?: number): boolean {
        if (ttlSeconds !== undefined) {
            return this.cache.set(key, value, ttlSeconds);
        }
        return this.cache.set(key, value);
    }

    /**
     * Delete key from cache
     */
    del(key: string): number {
        return this.cache.del(key);
    }

    /**
     * Delete multiple keys matching a pattern
     */
    delByPattern(pattern: string): number {
        const keys = this.cache.keys().filter(k => k.includes(pattern));
        return this.cache.del(keys);
    }

    /**
     * Flush entire cache
     */
    flush(): void {
        this.cache.flushAll();
    }

    /**
     * Get or set pattern - fetch from cache or execute fn and cache result
     */
    async getOrSet<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== undefined) {
            return cached;
        }

        const result = await fn();
        this.set(key, result, ttlSeconds);
        return result;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return this.cache.getStats();
    }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    CONSEJOS: 60 * 60,        // 1 hour
    MISIONES: 30 * 60,        // 30 minutes
    RETOS_ACTIVOS: 5 * 60,    // 5 minutes
    PROFILE: 2 * 60,          // 2 minutes
    USER_STATS: 60,           // 1 minute
    LEADERBOARD: 5 * 60       // 5 minutes
} as const;

// Cache key generators
export const CACHE_KEYS = {
    consejos: () => 'consejos:active',
    misiones: () => 'misiones:active',
    retosActivos: () => 'retos:active',
    profile: (id: string) => `profile:${id}`,
    userStats: (id: string) => `user-stats:${id}`,
    leaderboard: () => 'leaderboard:global'
} as const;
