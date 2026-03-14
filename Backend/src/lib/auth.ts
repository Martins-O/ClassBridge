import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, decodeToken, TokenPayload } from '@/lib/jwt';
import { getUserIdFromRequest } from '@/lib/session';

export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}

export function jwtAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
        try {
            const payload = verifyAccessToken(token);
            req.user = payload;
        } catch {
            // Token invalid, but continue without auth
        }
    }

    next();
}

export function getUserFromRequest(req: AuthenticatedRequest): string | null {
    if (req.user?.userId) {
        return req.user.userId;
    }
    return getUserIdFromRequest(req);
}
