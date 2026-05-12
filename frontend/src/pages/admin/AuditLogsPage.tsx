import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Filter, Clock, ShieldAlert } from 'lucide-react';
import { auditService, type AuditLog } from '@/services/api';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const params: any = { page, limit: 20 };
        if (filter !== 'all') params.action = filter;
        const { data } = await auditService.getAll(params);
        if (data.success) {
          setLogs(data.logs);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, [page, filter]);

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    log.resource.toLowerCase().includes(search.toLowerCase()) ||
    (log.details as any)?.event?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const config: Record<string, string> = {
      create: 'bg-emerald-100 text-emerald-700',
      update: 'bg-amber-100 text-amber-700',
      delete: 'bg-red-100 text-red-700',
      login: 'bg-blue-100 text-blue-700',
      logout: 'bg-slate-100 text-slate-600',
      read: 'bg-slate-100 text-slate-600',
    };
    const cls = config[action] || 'bg-slate-100 text-slate-600';
    return <Badge className={`${cls} border-none font-bold rounded-lg px-3 py-1`}>{action}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#064e3b] to-[#065f46] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#fef3c7]">Audit Trail</h2>
            <p className="mt-2 text-emerald-100/80 font-medium text-lg">Monitor and trace all platform activities</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
              <p className="text-xs text-emerald-200 uppercase tracking-widest font-bold mb-1">Total Logs</p>
              <p className="text-2xl font-black text-white">{total}</p>
            </div>
            <Button className="h-12 px-6 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold transition-all">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#064e3b] transition-colors" />
          <Input
            placeholder="Search by action, user email, or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#064e3b]/20 focus:border-[#064e3b] transition-all text-lg"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-14 w-[200px] rounded-2xl border-slate-200 font-bold">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card className="overflow-hidden border-none shadow-xl rounded-[2rem] bg-white/70 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Resource</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Details</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="px-8 py-5">{getActionBadge(log.action)}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#064e3b] font-black text-sm">
                          {log.userEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium text-sm">{log.resource}</td>
                    <td className="px-8 py-5 text-slate-400 max-w-[200px] truncate text-sm">
                      {(log.details as any)?.event || '—'}
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        {log.ipAddress || '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && (
            <div className="text-center py-24 bg-slate-50/50">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 shadow-lg mb-6">
                <ShieldAlert className="h-10 w-10 text-[#064e3b]/40" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No audit logs found</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">No activity matches your current search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p>Showing <span className="font-bold text-slate-900">{((page - 1) * 20) + 1}</span> to <span className="font-bold text-slate-900">{Math.min(page * 20, total)}</span> of <span className="font-bold text-slate-900">{total}</span> audit logs</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg border-slate-200" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-lg border-slate-200" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogsPage;