import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from './jwt';

export interface AuthRequest extends Request {
    user?: TokenPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
        return;
    }

    const token = authHeader.slice(7);
    
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
    }
}

export function authorize(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
            return;
        }

        next();
    };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const payload = verifyAccessToken(token);
            req.user = payload;
        } catch {
            // Token invalid, but continue without auth
        }
    }

    next();
}

export function requireSchoolAccess(requireSchoolAdmin: boolean = false) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (requireSchoolAdmin && !['super_admin', 'school_admin'].includes(req.user.role)) {
            res.status(403).json({ error: 'School admin access required', code: 'SCHOOL_ADMIN_REQUIRED' });
            return;
        }

        if (req.user.role === 'school_admin' && !req.user.schoolId) {
            res.status(403).json({ error: 'No school associated with account', code: 'NO_SCHOOL' });
            return;
        }

        next();
    };
}
