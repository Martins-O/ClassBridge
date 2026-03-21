import AuditLog from '@/models/AuditLog';
import { Request } from 'express';

export interface AuditLogData {
    userId: string;
    userEmail: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import';
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
    try {
        await AuditLog.create({
            userId: data.userId,
            userEmail: data.userEmail,
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            details: data.details,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}

export function extractRequestInfo(req: Request): { ipAddress: string; userAgent: string } {
    const ipAddress = req.ip || 
                      req.headers['x-forwarded-for'] as string || 
                      req.socket.remoteAddress || 
                      'unknown';
    
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return { ipAddress, userAgent };
}

export async function logUserAction(
    req: Request,
    userId: string,
    userEmail: string,
    action: AuditLogData['action'],
    resource: string,
    resourceId?: string,
    details?: Record<string, any>
): Promise<void> {
    const { ipAddress, userAgent } = extractRequestInfo(req);
    
    await createAuditLog({
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent
    });
}
