import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Activity, Server, Database, Cpu, MemoryStick, Users, Zap, AlertTriangle } from 'lucide-react';
import { systemService, SystemStatus, SystemMetrics } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const POLL_INTERVAL = 30000;

export function SystemStatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [statusRes, metricsRes] = await Promise.all([
        systemService.getStatus(),
        systemService.getMetrics(),
      ]);
      
      if (statusRes.data.success) {
        setStatus(statusRes.data);
      }
      if (metricsRes.data.success) {
        setMetrics(metricsRes.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch system status:', err);
      setError('Failed to load system status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusColor = (apiStatus: string) => {
    switch (apiStatus) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (apiStatus: string) => {
    switch (apiStatus) {
      case 'healthy': return 'bg-green-50 border-green-200';
      case 'degraded': return 'bg-yellow-50 border-yellow-200';
      case 'down': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getDbStatusColor = (dbStatus: string) => {
    return dbStatus === 'connected' ? 'text-green-500' : 'text-red-500';
  };

  const formatMemory = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchData}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
          <p className="text-gray-500 mt-1">
            Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <p className="text-yellow-700 text-sm">{error}</p>
        </div>
      )}

      <div className={`rounded-lg border p-6 ${getStatusBg(status?.apiStatus || 'healthy')}`}>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${
            status?.apiStatus === 'healthy' ? 'bg-green-500' :
            status?.apiStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
          } animate-pulse`} />
          <div>
            <h2 className="text-lg font-semibold">
              API Status: <span className={getStatusColor(status?.apiStatus || 'healthy')}>
                {status?.apiStatus?.toUpperCase() || 'UNKNOWN'}
              </span>
            </h2>
            <p className="text-sm text-gray-600">Uptime: {status?.uptimeFormatted || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Uptime</p>
              <p className="text-xl font-semibold">{status?.uptimeFormatted || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status?.databaseStatus === 'connected' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Database className={`h-5 w-5 ${status?.databaseStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Database</p>
              <p className={`text-xl font-semibold ${getDbStatusColor(status?.databaseStatus || 'disconnected')}`}>
                {status?.databaseStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-xl font-semibold">{status?.activeUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Requests (24h)</p>
              <p className="text-xl font-semibold">{status?.requestsLast24h || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MemoryStick className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Memory Usage</p>
              <p className="text-xl font-semibold">
                {formatMemory(status?.memory?.used || 0)} / {formatMemory(status?.memory?.total || 0)}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                (status?.memory?.percentage || 0) > 90 ? 'bg-red-500' :
                (status?.memory?.percentage || 0) > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(status?.memory?.percentage || 0, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{status?.memory?.percentage?.toFixed(1)}% used</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Cpu className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">CPU Cores</p>
              <p className="text-xl font-semibold">{status?.cpu?.cores || 0}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">1m</span>
              <span className="font-medium">{status?.cpu?.loadAverage?.[0]?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">5m</span>
              <span className="font-medium">{status?.cpu?.loadAverage?.[1]?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">15m</span>
              <span className="font-medium">{status?.cpu?.loadAverage?.[2]?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Zap className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Performance</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg Response</span>
              <span className="font-medium">{metrics?.avgResponseTime || 0}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Error Rate</span>
              <span className={`font-medium ${(metrics?.errorRate || 0) > 5 ? 'text-red-500' : 'text-gray-900'}`}>
                {metrics?.errorRate || 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Requests</span>
              <span className="font-medium">{metrics?.requestsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Memory History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.history || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(val) => new Date(val).toLocaleString()}
                  formatter={(value) => [`${value} MB`, 'Memory']}
                />
                <Area
                  type="monotone"
                  dataKey="memoryUsed"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Request Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.history || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(val) => new Date(val).toLocaleString()}
                  formatter={(value) => [`${value}`, 'Connections']}
                />
                <Line
                  type="monotone"
                  dataKey="activeConnections"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemStatusPage;
