import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from './jwt';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions, isSystemAdmin, isSchoolAdmin, isSchoolStaff } from './permissions';
import { UserRole } from '@/models/User';

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

export function authorize(...allowedRoles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role as UserRole)) {
            res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
            return;
        }

        next();
    };
}

export function requirePermission(permission: Permission) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (!hasPermission(req.user.role as UserRole, permission)) {
            res.status(403).json({ error: `Permission denied: ${permission}`, code: 'PERMISSION_DENIED' });
            return;
        }

        next();
    };
}

export function requireAnyPermission(permissions: Permission[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (!hasAnyPermission(req.user.role as UserRole, permissions)) {
            res.status(403).json({ error: 'Permission denied', code: 'PERMISSION_DENIED' });
            return;
        }

        next();
    };
}

export function requireAllPermissions(permissions: Permission[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (!hasAllPermissions(req.user.role as UserRole, permissions)) {
            res.status(403).json({ error: 'Permission denied', code: 'PERMISSION_DENIED' });
            return;
        }

        next();
    };
}

export function requireSystemAdmin() {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (!isSystemAdmin(req.user.role as UserRole)) {
            res.status(403).json({ error: 'System admin access required', code: 'SYSTEM_ADMIN_REQUIRED' });
            return;
        }

        next();
    };
}

export function requireSchoolAdmin() {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (!isSchoolAdmin(req.user.role as UserRole)) {
            res.status(403).json({ error: 'School admin access required', code: 'SCHOOL_ADMIN_REQUIRED' });
            return;
        }

        next();
    };
}

export function requireSchoolStaff() {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (!isSchoolStaff(req.user.role as UserRole)) {
            res.status(403).json({ error: 'School staff access required', code: 'SCHOOL_STAFF_REQUIRED' });
            return;
        }

        next();
    };
}

export function requireSchoolApproved() {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (req.user.role === 'system_admin') {
            next();
            return;
        }

        if (req.user.schoolStatus === 'pending') {
            res.status(403).json({ error: 'School is pending approval', code: 'SCHOOL_PENDING_APPROVAL' });
            return;
        }

        if (req.user.schoolStatus === 'rejected') {
            res.status(403).json({ error: 'School has been rejected', code: 'SCHOOL_REJECTED' });
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

export function requireSchoolAccess(requireSchoolAdminOnly: boolean = false) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
            return;
        }

        if (requireSchoolAdminOnly && !isSchoolAdmin(req.user.role as UserRole)) {
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
