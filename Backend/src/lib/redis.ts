import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function initRedis(): Promise<RedisClientType | null> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    try {
        redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        return new Error('Redis reconnection failed');
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('Redis connected');
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        return null;
    }
}

export function getRedisClient(): RedisClientType | null {
    return redisClient;
}

export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}
