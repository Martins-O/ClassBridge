import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

interface UserRateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string;
    keyGenerator?: (req: Request) => string;
}

export function createUserRateLimiter(options: UserRateLimitOptions = {}) {
    const {
        windowMs = 15 * 60 * 1000,
        max = 100,
        message = 'Too many requests',
        keyGenerator,
    } = options;

    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            error: message,
            code: 'RATE_LIMIT_EXCEEDED',
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: keyGenerator || ((req: Request) => {
            const authHeader = req.headers.authorization;
            const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
            
            if (token) {
                return `token:${token.substring(0, 20)}`;
            }
            
            return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
        }),
        handler: (req: Request, res: Response) => {
            res.status(429).json({
                success: false,
                error: message,
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(windowMs / 1000),
            });
        },
    });
}

export const defaultUserLimiter = createUserRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

export const authRateLimiter = createUserRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts',
});

export const uploadRateLimiter = createUserRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: 'Too many file uploads',
});

export const apiWriteRateLimiter = createUserRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: 'Too many write operations',
});

export const sensitiveActionLimiter = createUserRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many sensitive actions',
});

interface TieredRateLimitOptions {
    tiers: {
        windowMs: number;
        max: number;
        condition?: (req: Request) => boolean;
    }[];
}

export function createTieredRateLimiter(options: TieredRateLimitOptions) {
    return (req: Request, res: Response, next: () => void) => {
        for (const tier of options.tiers) {
            if (!tier.condition || tier.condition(req)) {
                const limiter = createUserRateLimiter({
                    windowMs: tier.windowMs,
                    max: tier.max,
                });
                return limiter(req, res, next);
            }
        }
        next();
    };
}
