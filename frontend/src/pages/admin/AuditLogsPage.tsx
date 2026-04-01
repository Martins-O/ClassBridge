import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Filter, User, Clock, Activity } from 'lucide-react';

interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        _id: '1',
        action: 'LOGIN',
        entityType: 'user',
        entityId: 'user1',
        userId: 'user1',
        userName: 'Super Admin',
        details: 'Successful login',
        ipAddress: '192.168.1.1',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        action: 'CREATE',
        entityType: 'school',
        entityId: 'school1',
        userId: 'user1',
        userName: 'Super Admin',
        details: 'Created new school: Test School',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: '3',
        action: 'UPDATE',
        entityType: 'user',
        entityId: 'user2',
        userId: 'user1',
        userName: 'Super Admin',
        details: 'Updated user role',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        _id: '4',
        action: 'APPROVE',
        entityType: 'school',
        entityId: 'school2',
        userId: 'user1',
        userName: 'Super Admin',
        details: 'Approved school registration',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        _id: '5',
        action: 'DELETE',
        entityType: 'course',
        entityId: 'course1',
        userId: 'user1',
        userName: 'Super Admin',
        details: 'Deleted course',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
      },
    ];
    setLogs(mockLogs);
    setIsLoading(false);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || log.action === filter;
    return matchesSearch && matchesFilter;
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      CREATE: 'success',
      UPDATE: 'warning',
      DELETE: 'destructive',
      LOGIN: 'default',
      LOGOUT: 'default',
      APPROVE: 'success',
      REJECT: 'destructive',
    };
    return <Badge variant={variants[action] || 'default'}>{action}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-500">Track system activities and changes</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
            <SelectItem value="APPROVE">Approve</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{log.details}</td>
                    <td className="px-6 py-4 text-gray-500">{log.ipAddress}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AuditLogsPage;