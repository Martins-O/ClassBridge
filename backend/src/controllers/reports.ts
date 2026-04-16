import { Request, Response } from 'express';
import { reportsService } from '../services/reports.service';

export async function getAuditLogsReport(req: Request, res: Response) {
  try {
    const {
      startDate,
      endDate,
      action,
      resource,
      userId,
      page,
      limit,
      format,
    } = req.query;

    const params = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      action: action as string | undefined,
      resource: resource as string | undefined,
      userId: userId as string | undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      format: format as 'json' | 'csv' | undefined,
    };

    const result = await reportsService.getAuditLogReport(params);

    if (typeof result === 'string') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      return res.send(result);
    }

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get audit logs report error:', error);
    return res.status(500).json({ error: 'Failed to generate audit report' });
  }
}

export async function getActivityReport(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const params = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await reportsService.getActivityReport(params);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get activity report error:', error);
    return res.status(500).json({ error: 'Failed to generate activity report' });
  }
}
