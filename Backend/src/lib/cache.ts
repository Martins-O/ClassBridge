import { getRedisClient } from './redis';

const DEFAULT_TTL = 300;

export interface CacheOptions {
    ttl?: number;
    prefix?: string;
}

export async function getFromCache<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) {
        return null;
    }

    try {
        const cached = await redis.get(key);
        if (cached) {
            return JSON.parse(cached) as T;
        }
        return null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

export async function setToCache<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const redis = getRedisClient();
    if (!redis) {
        return;
    }

    const ttl = options.ttl || DEFAULT_TTL;

    try {
        await redis.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

export async function deleteFromCache(key: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) {
        return;
    }

    try {
        await redis.del(key);
    } catch (error) {
        console.error('Cache delete error:', error);
    }
}

export async function deletePatternFromCache(pattern: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) {
        return;
    }

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
        }
    } catch (error) {
        console.error('Cache delete pattern error:', error);
    }
}

export function buildCacheKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
}

export async function cacheWithInvalidation<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    const cached = await getFromCache<T>(key);
    if (cached) {
        return cached;
    }

    const data = await fetchFn();
    await setToCache(key, data, options);
    return data;
}
