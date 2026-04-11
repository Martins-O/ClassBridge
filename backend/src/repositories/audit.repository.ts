import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog';

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

class AuditRepository {
  async createLog(params: LogAuditParams) {
    const log = new AuditLog({
      userId: new mongoose.Types.ObjectId(params.userId),
      userEmail: params.userEmail,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date()
    });
    return log.save();
  }

  async findAll(params: { page?: number; limit?: number; action?: string; resource?: string; userId?: string; startDate?: Date; endDate?: Date }) {
    const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) (filter.timestamp as Record<string, Date>).$gte = startDate;
      if (endDate) (filter.timestamp as Record<string, Date>).$lte = endDate;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter)
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByUserId(userId: string, limit = 50) {
    return AuditLog.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  async getRecentLogs(limit = 100) {
    return AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }
}

export const auditRepository = new AuditRepository();