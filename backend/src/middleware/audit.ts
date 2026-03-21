import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/lib/auth';
import { createAuditLog, extractRequestInfo, AuditLogData } from '@/lib/auditLogger';

export interface AuditOptions {
    action: AuditLogData['action'];
    resource: string;
    getResourceId?: (req: AuthenticatedRequest) => string | undefined;
    getDetails?: (req: AuthenticatedRequest, res: Response) => Record<string, any> | undefined;
}

export function auditMiddleware(options: AuditOptions) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const originalJson = res.json.bind(res);

        res.json = function(body: unknown) {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const resourceId = options.getResourceId ? options.getResourceId(req) : req.params.id;
                const details = options.getDetails ? options.getDetails(req, res) : undefined;
                
                const { ipAddress, userAgent } = extractRequestInfo(req);

                createAuditLog({
                    userId: req.user.userId,
                    userEmail: req.user.email,
                    action: options.action,
                    resource: options.resource,
                    resourceId,
                    details: {
                        ...details,
                        method: req.method,
                        path: req.path,
                        statusCode: res.statusCode,
                    },
                    ipAddress,
                    userAgent,
                }).catch((error) => {
                    console.error('Audit log error:', error);
                });
            }

            return originalJson(body);
        };

        next();
    };
}

export function auditLogin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { ipAddress, userAgent } = extractRequestInfo(req);

    const originalJson = res.json.bind(res);
    res.json = function(body: unknown) {
        if (res.statusCode === 200 && req.body?.email) {
            createAuditLog({
                userId: 'unknown',
                userEmail: req.body.email,
                action: 'login',
                resource: 'auth',
                details: { success: res.statusCode === 200 },
                ipAddress,
                userAgent,
            }).catch((error) => {
                console.error('Audit log error:', error);
            });
        }
        return originalJson(body);
    };

    next();
}

export const AUDIT_ACTIONS = {
    CREATE: 'create' as const,
    READ: 'read' as const,
    UPDATE: 'update' as const,
    DELETE: 'delete' as const,
    LOGIN: 'login' as const,
    LOGOUT: 'logout' as const,
    EXPORT: 'export' as const,
    IMPORT: 'import' as const,
} as const;

export const AUDIT_RESOURCES = {
    USER: 'user',
    SCHOOL: 'school',
    CLASS: 'class',
    COURSE: 'course',
    GRADE: 'grade',
    ASSESSMENT: 'assessment',
    TRANSCRIPT: 'transcript',
    NOTIFICATION: 'notification',
    AUTH: 'auth',
    FILE: 'file',
} as const;
