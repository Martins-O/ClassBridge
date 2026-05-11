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
        <div className="w-10 h-10 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
       <div className="relative overflow-hidden rounded-[2.5rem] bg-[#064e3b] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#fef3c7]">Verification Hub</h2>
            <p className="mt-2 text-emerald-100/80 font-medium text-lg">Review and authorize institutional registration requests</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
                <p className="text-xs text-emerald-200 uppercase tracking-widest font-bold mb-1">Pending</p>
                <p className="text-2xl font-black text-white">{approvals.length}</p>
             </div>
          </div>
        </div>
        
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#064e3b] transition-colors" />
        <Input
          placeholder="Search requests by school name or applicant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#064e3b]/20 focus:border-[#064e3b] transition-all text-lg"
        />
      </div>

      {/* Approvals Table */}
      <Card className="rounded-[2rem] border-none shadow-xl bg-white/70 backdrop-blur-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Institution Hub</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Requested By</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Submission Date</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApprovals.map((approval) => (
                  <tr key={approval._id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#064e3b] font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                          {approval.schoolName.charAt(0)}
                        </div>
                        <Link to={`/approvals/${approval._id}`} className="font-bold text-slate-900 group-hover:text-[#064e3b] transition-colors text-lg">
                          {approval.schoolName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-medium">
                      {typeof approval.requestedBy === 'object' && approval.requestedBy !== null
                        ? (approval.requestedBy as any).name || (approval.requestedBy as any).email
                        : String(approval.requestedBy || 'Central Hub')}
                    </td>
                    <td className="px-8 py-6">{getStatusBadge(approval.status)}</td>
                    <td className="px-8 py-6 text-slate-500 font-medium">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/approvals/${approval._id}`}>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-100 hover:text-[#064e3b]">
                            <Eye className="h-5 w-5" />
                          </Button>
                        </Link>
                        {approval.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl hover:bg-emerald-100 text-emerald-600"
                              onClick={() => handleApprove(approval._id)}
                              disabled={processingId === approval._id}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl hover:bg-red-100 text-red-600"
                              onClick={() => openRejectModal(approval._id)}
                              disabled={processingId === approval._id}
                            >
                              <XCircle className="h-5 w-5" />
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