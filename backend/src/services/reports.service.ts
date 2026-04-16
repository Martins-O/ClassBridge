import AuditLog from '../models/AuditLog';
import User from '../models/User';

interface AuditLogReport {
  logs: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ActivityReport {
  totalLogins: number;
  totalActions: number;
  activeUsers: number;
  byRole: Record<string, number>;
  byAction: Record<string, number>;
}

class ReportsService {
  async getAuditLogReport(params: {
    startDate?: Date;
    endDate?: Date;
    action?: string;
    resource?: string;
    userId?: string;
    page?: number;
    limit?: number;
    format?: 'json' | 'csv';
  }): Promise<AuditLogReport | string> {
    const {
      startDate,
      endDate,
      action,
      resource,
      userId,
      page = 1,
      limit = 50,
      format = 'json',
    } = params;

    const query: any = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;

    if (format === 'csv') {
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .lean();

      const csvHeader = 'Timestamp,User Email,Action,Resource,Resource ID,IP Address,User Agent\n';
      const csvRows = logs.map(log => 
        `"${log.timestamp}","${log.userEmail}","${log.action}","${log.resource}","${log.resourceId || ''}","${log.ipAddress || ''}","${log.userAgent || ''}"`
      ).join('\n');

      return csvHeader + csvRows;
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getActivityReport(params?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<ActivityReport> {
    const { startDate, endDate } = params || {};

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = startDate;
      if (endDate) dateFilter.timestamp.$lte = endDate;
    }

    const [logs, activeUsers, usersByRole] = await Promise.all([
      AuditLog.find(dateFilter).lean(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    const byRole: Record<string, number> = {};
    usersByRole.forEach(item => {
      byRole[item._id] = item.count;
    });

    const byAction: Record<string, number> = {};
    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });

    const totalLogins = logs.filter(l => l.action === 'login').length;
    const totalActions = logs.length;

    return {
      totalLogins,
      totalActions,
      activeUsers,
      byRole,
      byAction,
    };
  }
}

export const reportsService = new ReportsService();
