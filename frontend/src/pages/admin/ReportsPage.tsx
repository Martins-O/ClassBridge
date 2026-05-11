import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { reportsService, ActivityReport, AuditLogReport } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, RefreshCw, Users, Activity } from 'lucide-react';

const CHART_COLORS = ['#064e3b', '#065f46', '#d97706', '#b45309', '#1d4ed8', '#7c3aed'];

export function ReportsPage() {
  const [activity, setActivity] = useState<ActivityReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogReport | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    setIsLoading(true);
    try {
      const params = { startDate: startDate || undefined, endDate: endDate || undefined };
      const [activityRes, auditRes] = await Promise.all([
        reportsService.getActivity(params),
        reportsService.getAuditLogs({ ...params, limit: 100 }),
      ]);
      if (activityRes.data) setActivity(activityRes.data);
      if (auditRes.data) setAuditLogs(auditRes.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.format = 'csv';
      const response = await reportsService.exportAuditLogsCsv(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const roleData = activity?.byRole
    ? Object.entries(activity.byRole).map(([name, value]) => ({ name, value }))
    : [];

  const actionData = activity?.byAction
    ? Object.entries(activity.byAction).map(([name, value]) => ({ name, value }))
    : [];

  if (isLoading && !activity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Active Users', value: activity?.activeUsers || 0, icon: Users, color: 'blue' },
    { label: 'Total Logins', value: activity?.totalLogins || 0, icon: Activity, color: 'emerald' },
    { label: 'Total Actions', value: activity?.totalActions || 0, icon: FileText, color: 'amber' },
    { label: 'Audit Logs', value: auditLogs?.total || 0, icon: Download, color: 'purple' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#064e3b] to-[#065f46] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#fef3c7]">Reports & Analytics</h2>
            <p className="mt-2 text-emerald-100/80 font-medium text-lg">View activity reports and export institutional audit data</p>
          </div>
          <div className="flex gap-3">
            <Button
              className="h-12 px-6 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
              onClick={fetchReports}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              className="bg-[#fbbf24] hover:bg-[#d97706] text-[#064e3b] font-bold px-8 h-12 rounded-xl shadow-lg transition-all hover:scale-105 border-none"
              onClick={handleExportCsv}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-end gap-4 bg-white rounded-[2rem] shadow-xl p-6 border-none">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44 h-12 rounded-2xl border-slate-200" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">End Date</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44 h-12 rounded-2xl border-slate-200" />
        </div>
        <Button onClick={fetchReports} className="h-12 px-8 rounded-2xl bg-[#064e3b] hover:bg-[#065f46] text-white font-bold">
          Apply Filter
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-[2rem] border-none shadow-xl p-6 flex items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-2xl">
            <div className={`p-3 rounded-2xl bg-${stat.color}-50`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-[2rem] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-black text-slate-900">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                    {roleData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-black text-slate-900">Actions Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#064e3b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Logs */}
      <Card className="rounded-[2rem] border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-black text-slate-900">Recent Audit Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Resource</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {auditLogs?.logs?.slice(0, 10).map((log) => (
                  <tr key={log._id} className="hover:bg-emerald-50/30 transition-all">
                    <td className="px-8 py-4 text-sm text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-900">{log.userEmail}</td>
                    <td className="px-8 py-4">
                      <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold rounded-lg px-3">{log.action}</Badge>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500">{log.resource}</td>
                    <td className="px-8 py-4 text-xs font-mono text-slate-400">{log.ipAddress || '—'}</td>
                  </tr>
                ))}
                {(!auditLogs?.logs || auditLogs.logs.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">No audit logs available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;
