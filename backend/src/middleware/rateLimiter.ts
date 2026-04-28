import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

interface UserRateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
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
        validate: false,
        keyGenerator: keyGenerator || ((req: Request) => {
            const authHeader = req.headers.authorization;
            const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
            
            if (token) {
                return `token:${token.substring(0, 20)}`;
            }
            
            return req.ip || req.socket.remoteAddress || 'unknown';
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

// Stricter rate limiting for signup - per IP
export const signupRateLimiter = createUserRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many signup attempts from this IP. Please try again later.',
});

// Email-based rate limiting for signup
export const signupEmailRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        error: 'Too many signup attempts for this email address.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req: Request) => {
        return `email:${req.body?.email?.toLowerCase() || 'unknown'}`;
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: 'Too many signup attempts for this email address.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: 3600,
        });
    },
});

// Combined signup limiter (IP + email)
export function signupCombinedLimiter(req: Request, res: Response, next: () => void) {
    signupRateLimiter(req, res, () => {
        signupEmailRateLimiter(req, res, next);
    });
}

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
