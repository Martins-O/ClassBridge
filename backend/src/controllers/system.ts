import { Request, Response } from 'express';
import { systemService } from '../services/system.service';
import { requireSystemAdmin } from '../lib/authorization';

export async function getSystemStatus(req: Request, res: Response) {
  try {
    const status = await systemService.getStatus();
    const formattedUptime = systemService.formatUptime(status.uptime);
    
    res.json({
      success: true,
      ...status,
      uptimeFormatted: formattedUptime,
    });
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get system status' 
    });
  }
}

export async function getSystemMetrics(req: Request, res: Response) {
  try {
    const metrics = await systemService.getMetrics();
    const history = systemService.getMetricsHistory();
    
    res.json({
      success: true,
      ...metrics,
      history,
    });
  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get system metrics' 
    });
  }
}

export function systemStatusHandler() {
  return [requireSystemAdmin(), async (req: Request, res: Response) => {
    await getSystemStatus(req, res);
  }];
}

export function systemMetricsHandler() {
  return [requireSystemAdmin(), async (req: Request, res: Response) => {
    await getSystemMetrics(req, res);
  }];
}
