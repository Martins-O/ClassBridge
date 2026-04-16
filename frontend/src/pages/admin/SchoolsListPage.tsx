import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Search, Eye, Edit, AlertTriangle, Power } from 'lucide-react';
import { schoolService } from '../../services/api';
import type { School } from '../../types';

export function SchoolsListPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [suspendModal, setSuspendModal] = useState<{ open: boolean; school: School | null; action: 'suspend' | 'activate' }>({
    open: false,
    school: null,
    action: 'suspend',
  });
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  async function fetchSchools() {
    try {
      const response = await schoolService.getAll({ limit: 100 });
      if (response.data?.data) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.name.toLowerCase().includes(search.toLowerCase()) ||
      school.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'destructive',
      suspended: 'destructive',
      active: 'success',
    };
    const labels: Record<string, string> = {
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      suspended: 'Suspended',
      active: 'Active',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const handleSuspendClick = (school: School) => {
    setSuspendModal({ open: true, school, action: 'suspend' });
    setSuspendReason('');
  };

  const handleActivateClick = (school: School) => {
    setSuspendModal({ open: true, school, action: 'activate' });
    setSuspendReason('');
  };

  const handleSubmit = async () => {
    if (!suspendModal.school) return;
    
    setIsSubmitting(true);
    try {
      const action = suspendModal.action === 'suspend' ? 'suspended' : 'active';
      await schoolService.updateStatus(suspendModal.school._id, {
        status: action,
        reason: suspendModal.action === 'suspend' ? suspendReason : undefined,
      });
      setSuspendModal({ open: false, school: null, action: 'suspend' });
      fetchSchools();
    } catch (error) {
      console.error('Failed to update school status:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schools</h2>
          <p className="text-gray-500">View and manage schools in the system</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search schools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchools.map((school) => (
                  <tr key={school._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/schools/${school._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {school.name}
                      </Link>
                      {school.status === 'suspended' && (
                        <p className="text-xs text-red-500 mt-1">
                          Suspended: {school.suspensionReason || 'No reason provided'}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{school.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(school.status)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{school.subscriptionType}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {school.status === 'suspended' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateClick(school)}
                          >
                            <Power className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendClick(school)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        <Link to={`/schools/${school._id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/schools/${school._id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSchools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No schools found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={suspendModal.open} onOpenChange={(open) => !open && setSuspendModal({ open: false, school: null, action: 'suspend' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspendModal.action === 'suspend' ? 'Suspend School' : 'Activate School'}
            </DialogTitle>
            <DialogDescription>
              {suspendModal.action === 'suspend'
                ? `Are you sure you want to suspend ${suspendModal.school?.name}? Users from this school will not be able to access the system.`
                : `Are you sure you want to activate ${suspendModal.school?.name}? Users will regain access to the system.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {suspendModal.action === 'suspend' && (
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for suspension (optional)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter reason for suspension..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendModal({ open: false, school: null, action: 'suspend' })}>
              Cancel
            </Button>
            <Button
              variant={suspendModal.action === 'suspend' ? 'destructive' : 'default'}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : suspendModal.action === 'suspend' ? 'Suspend' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SchoolsListPage;
