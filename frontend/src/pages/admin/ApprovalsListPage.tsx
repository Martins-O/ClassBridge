import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { approvalService } from '@/services/api';
import type { Approval } from '@/services/api';

export function ApprovalsListPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    async function fetchApprovals() {
      try {
        const response = await approvalService.getPending();
        if (response.data?.approvals) {
          setApprovals(response.data.approvals);
        }
      } catch (error) {
        console.error('Failed to fetch approvals:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchApprovals();
  }, []);

  const filteredApprovals = approvals.filter(approval =>
    approval.schoolName.toLowerCase().includes(search.toLowerCase()) ||
    approval.requestedBy.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approvalService.approve(id);
      setApprovals(approvals.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setProcessingId(rejectId);
    setRejectModalOpen(false);
    try {
      await approvalService.reject(rejectId, rejectReason);
      setApprovals(approvals.filter(a => a._id !== rejectId));
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setProcessingId(null);
      setRejectId(null);
      setRejectReason('');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Requests</h2>
          <p className="text-gray-500">Manage school registration requests</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {approvals.length} Pending
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search approvals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Approvals Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApprovals.map((approval) => (
                  <tr key={approval._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/approvals/${approval._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {approval.schoolName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {approval.requestedBy?.name || approval.requestedBy?.email || String(approval.requestedBy)}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(approval.status)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/approvals/${approval._id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {approval.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-green-600"
                              onClick={() => handleApprove(approval._id)}
                              disabled={processingId === approval._id}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600"
                              onClick={() => openRejectModal(approval._id)}
                              disabled={processingId === approval._id}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredApprovals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No approval requests found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject School Request</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="reject-reason">Rejection Reason</Label>
            <Input
              id="reject-reason"
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApprovalsListPage;