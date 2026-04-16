import os from 'os';
import mongoose from 'mongoose';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';

interface SystemStatus {
  uptime: number;
  apiStatus: 'healthy' | 'degraded' | 'down';
  databaseStatus: 'connected' | 'disconnected';
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    cores: number;
    loadAverage: number[];
  };
  activeUsers: number;
  requestsLast24h: number;
  timestamp: string;
}

interface SystemMetrics {
  requestsCount: number;
  errorRate: number;
  avgResponseTime: number;
  uptime: number;
  timestamp: string;
}

interface MetricsHistory {
  timestamp: string;
  memoryUsed: number;
  memoryTotal: number;
  activeConnections: number;
}

class SystemService {
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];
  private metricsHistory: MetricsHistory[] = [];
  private maxHistorySize: number = 288;

  async getStatus(): Promise<SystemStatus> {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const activeTokens = await RefreshToken.countDocuments({
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    const loadAverage = os.loadavg();

    let apiStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (dbStatus === 'disconnected') {
      apiStatus = 'down';
    } else if (memoryPercentage > 90 || loadAverage[0] > os.cpus().length) {
      apiStatus = 'degraded';
    }

    return {
      uptime: uptimeSeconds,
      apiStatus,
      databaseStatus: dbStatus,
      memory: {
        used: Math.round(usedMemory / 1024 / 1024),
        total: Math.round(totalMemory / 1024 / 1024),
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: loadAverage.map(v => Math.round(v * 100) / 100),
      },
      activeUsers: activeTokens,
      requestsLast24h: this.requestCount,
      timestamp: new Date().toISOString(),
    };
  }

  async getMetrics(): Promise<SystemMetrics> {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const avgResponseTime = this.responseTimes.length > 0
      ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
      : 0;
    const errorRate = this.requestCount > 0
      ? Math.round((this.errorCount / this.requestCount) * 10000) / 100
      : 0;

    return {
      requestsCount: this.requestCount,
      errorRate,
      avgResponseTime,
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
    };
  }

  getMetricsHistory(): MetricsHistory[] {
    return [...this.metricsHistory];
  }

  recordRequest(responseTime: number): void {
    this.requestCount++;
    this.responseTimes.push(responseTime);
    
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    const memoryUsage = process.memoryUsage();
    const historyEntry: MetricsHistory = {
      timestamp: new Date().toISOString(),
      memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      activeConnections: 0,
    };

    this.metricsHistory.push(historyEntry);
    
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }
  }

  recordError(): void {
    this.errorCount++;
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
}

export const systemService = new SystemService();
