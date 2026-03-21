import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '@/lib/redis';
import { getCloudinaryConfig } from '@/lib/cloudinary';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    services: {
        database: ServiceHealth;
        redis: ServiceHealth;
        cloudinary: ServiceHealth;
    };
    version: string;
}

interface ServiceHealth {
    status: 'up' | 'down';
    latency?: number;
    message?: string;
}

export async function getLiveness(req: Request, res: Response) {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString()
    });
}

export async function getReadiness(req: Request, res: Response) {
    try {
        const state = mongoose.connection.readyState;
        if (state !== 1) {
            return res.status(503).json({
                status: 'not ready',
                reason: 'Database not connected'
            });
        }
        
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            reason: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function getHealth(req: Request, res: Response) {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

    const health: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: Math.round(usedMemory / 1024 / 1024),
            total: Math.round(totalMemory / 1024 / 1024),
            percentage: memoryPercentage
        },
        version: process.env.npm_package_version || '1.0.0',
        services: {
            database: { status: 'down' },
            redis: { status: 'down' },
            cloudinary: { status: 'down' }
        }
    };

    const checks = await Promise.allSettled([
        checkDatabase(),
        checkRedis(),
        checkCloudinary()
    ]);

    const dbResult = checks[0];
    const redisResult = checks[1];
    const cloudinaryResult = checks[2];

    if (dbResult.status === 'fulfilled') {
        health.services.database = dbResult.value;
    }

    if (redisResult.status === 'fulfilled') {
        health.services.redis = redisResult.value;
    }

    if (cloudinaryResult.status === 'fulfilled') {
        health.services.cloudinary = cloudinaryResult.value;
    }

    const downServices = Object.values(health.services).filter(s => s.status === 'down');
    if (downServices.length === 0) {
        health.status = 'healthy';
    } else if (downServices.length < Object.keys(health.services).length) {
        health.status = 'degraded';
    } else {
        health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);
}

async function checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
        const state = mongoose.connection.readyState;
        if (state === 1) {
            const conn = mongoose.connection;
            await conn.db?.command({ ping: 1 });
            return {
                status: 'up',
                latency: Date.now() - start,
                message: 'Connected to MongoDB'
            };
        }
        return {
            status: 'down',
            message: `MongoDB state: ${state === 0 ? 'disconnected' : 'connecting'}`
        };
    } catch (error) {
        return {
            status: 'down',
            message: error instanceof Error ? error.message : 'Database check failed'
        };
    }
}

async function checkRedis(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
        const redis = getRedisClient();
        if (!redis) {
            return {
                status: 'down',
                message: 'Redis client not initialized'
            };
        }
        await redis.ping();
        return {
            status: 'up',
            latency: Date.now() - start,
            message: 'Connected to Redis'
        };
    } catch (error) {
        return {
            status: 'down',
            message: error instanceof Error ? error.message : 'Redis check failed'
        };
    }
}

async function checkCloudinary(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
        const config = getCloudinaryConfig();
        if (!config.cloudName || !config.apiKey || !config.apiSecret) {
            return {
                status: 'down',
                message: 'Cloudinary not configured'
            };
        }
        return {
            status: 'up',
            latency: Date.now() - start,
            message: 'Cloudinary configured'
        };
    } catch (error) {
        return {
            status: 'down',
            message: error instanceof Error ? error.message : 'Cloudinary check failed'
        };
    }
}
