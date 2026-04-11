import { auditRepository } from '../repositories/audit.repository';

export interface LogAuditParams {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

class AuditService {
  async logAction(params: LogAuditParams) {
    try {
      return await auditRepository.createLog(params);
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async getAuditLogs(params: GetAuditLogsParams) {
    return auditRepository.findAll(params);
  }

  async getRecentLogs(limit?: number) {
    return auditRepository.getRecentLogs(limit);
  }

  async getUserActivity(userId: string, limit?: number) {
    return auditRepository.findByUserId(userId, limit);
  }

  async logLogin(userId: string, userEmail: string, ipAddress?: string, userAgent?: string) {
    return this.logAction({
      userId,
      userEmail,
      action: 'login',
      resource: 'auth',
      ipAddress,
      userAgent,
      details: { event: 'user_login' }
    });
  }

  async logLogout(userId: string, userEmail: string, ipAddress?: string, userAgent?: string) {
    return this.logAction({
      userId,
      userEmail,
      action: 'logout',
      resource: 'auth',
      ipAddress,
      userAgent,
      details: { event: 'user_logout' }
    });
  }

  async logResourceCreation(userId: string, userEmail: string, resource: string, resourceId: string, details?: Record<string, unknown>, ipAddress?: string, userAgent?: string) {
    return this.logAction({
      userId,
      userEmail,
      action: 'create',
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent
    });
  }

  async logResourceUpdate(userId: string, userEmail: string, resource: string, resourceId: string, details?: Record<string, unknown>, ipAddress?: string, userAgent?: string) {
    return this.logAction({
      userId,
      userEmail,
      action: 'update',
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent
    });
  }

  async logResourceDeletion(userId: string, userEmail: string, resource: string, resourceId: string, details?: Record<string, unknown>, ipAddress?: string, userAgent?: string) {
    return this.logAction({
      userId,
      userEmail,
      action: 'delete',
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent
    });
  }

  async logResourceRead(userId: string, userEmail: string, resource: string, resourceId: string, ipAddress?: string, userAgent?: string) {
    return this.logAction({
      userId,
      userEmail,
      action: 'read',
      resource,
      resourceId,
      ipAddress,
      userAgent
    });
  }
}

export const auditService = new AuditService();