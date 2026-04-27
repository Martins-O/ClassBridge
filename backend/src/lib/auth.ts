import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, decodeToken, TokenPayload } from '@/lib/jwt';
import { getUserIdFromRequest } from '@/lib/session';

export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}

import User from '@/models/User';

export async function jwtAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
        try {
            const payload = verifyAccessToken(token);
            req.user = payload;
            return next();
        } catch {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }

    // Fallback to cookie
    const userId = getUserIdFromRequest(req);
    if (userId) {
        try {
            const user = await User.findById(userId);
            if (user) {
                req.user = {
                    userId: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    schoolId: user.schoolId?.toString(),
                    schoolApproved: user.isApproved,
                    schoolStatus: user.isActive ? 'approved' : 'pending'
                };
                return next();
            }
        } catch (err) {
            console.error('Middleware cookie error:', err);
        }
    }

    return res.status(401).json({ error: 'Authentication required' });
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
