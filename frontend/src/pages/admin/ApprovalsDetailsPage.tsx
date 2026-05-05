import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Calendar } from 'lucide-react';
import { approvalService } from '@/services/api';
import type { Approval } from '@/services/api';

export function ApprovalsDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [approval, setApproval] = useState<Approval | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchApproval() {
      if (!id) return;
      try {
        const response = await approvalService.getById(id);
        const approvalData = (response.data as any)?.approval;
        if (approvalData) setApproval(approvalData);
      } catch (error) {
        console.error('Failed to fetch approval:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchApproval();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setIsProcessing(true);
    try {
      await approvalService.approve(id);
      navigate('/approvals');
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await approvalService.reject(id, rejectReason);
      navigate('/approvals');
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Approval not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/approvals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Request</h2>
          <p className="text-gray-500">Review school registration request</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-500">School Name</p>
                <p className="text-xl font-bold">{approval.schoolName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Requested By</p>
                <p className="font-medium">
                  {typeof approval.requestedBy === 'object' && approval.requestedBy !== null
                    ? (approval.requestedBy as any).name || (approval.requestedBy as any).email
                    : String(approval.requestedBy || 'Unknown')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Request Date</p>
                <p className="font-medium">
                  {new Date(approval.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              {getStatusBadge(approval.status)}
            </div>
            {approval.reason && (
              <div>
                <p className="text-sm text-gray-500">Rejection Reason</p>
                <p className="font-medium text-red-600">{approval.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {approval.status === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason (required for rejection)</Label>
                <Input
                  id="reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Already Processed */}
        {approval.status !== 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                This request has been {approval.status} on{' '}
                {new Date(approval.updatedAt).toLocaleDateString()}.
              </p>
              {approval.reason && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Reason:</p>
                  <p className="font-medium">{approval.reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ApprovalsDetailsPage;