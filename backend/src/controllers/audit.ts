import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { page, limit, action, resource, userId, startDate, endDate } = req.query;
    const result = await auditService.getAuditLogs({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      action: action as string,
      resource: resource as string,
      userId: userId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });
    return res.json({
      success: true,
      logs: result.logs,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
}

export async function getRecentLogs(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await auditService.getRecentLogs(limit);
    return res.json({ success: true, logs });
  } catch (error) {
    console.error('Get recent logs error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch recent logs' });
  }
}

