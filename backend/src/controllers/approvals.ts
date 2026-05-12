import { Request, Response } from 'express';
import { approvalService } from '@/services/approval.service';
import { auditService } from '@/services/audit.service';
import { AuthRequest } from '@/lib/authorization';
import { sendSuccess, sendCreated } from '@/lib/apiResponse';

export async function requestSchool(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isPending = user.role === 'pending_school_admin';
    const isSchoolAdmin = user.role === 'school_admin';

    if (!isPending && !isSchoolAdmin) {
      return res.status(403).json({ error: 'Only pending or active school administrators can request a school' });
    }

    const { name, email, phone, address, website, description } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'School name and email are required'
      });
    }

    const result = await approvalService.requestSchool({
      name,
      email,
      phone,
      address,
      website,
      description,
      adminId: user.userId,
      adminEmail: user.email,
      adminName: user.name,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    if (isSchoolAdmin) {
      await auditService.logResourceCreation(
        user.userId,
        user.email,
        'school',
        result.schoolId || '',
        { action: 'created', name },
        req.ip || 'unknown',
        req.headers['user-agent']
      );
    }

      return sendCreated(res, {
        schoolId: result.schoolId,
        approvalId: result.approvalId,
      }, result.message);
  } catch (error) {
    console.error('Request school error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingApprovals(req: Request, res: Response) {
  try {
    const approvals = await approvalService.getPendingApprovals();
    return sendSuccess(res, approvals);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getApprovalById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const approval = await approvalService.getApprovalById(id);

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    return sendSuccess(res, approval);
  } catch (error) {
    console.error('Get approval error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMySchoolRequest(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requests = await approvalService.getMyRequest(req.user.userId);
    return sendSuccess(res, requests);
  } catch (error) {
    console.error('Get my school request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveSchool(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Only system administrators can approve schools' });
    }

    const { id } = req.params;
    const result = await approvalService.approveSchool(id, req.user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    await auditService.logResourceUpdate(
      req.user.userId,
      req.user.email,
      'school',
      result.schoolId || id,
      { action: 'approved', approvalId: id },
      req.ip || 'unknown',
      req.headers['user-agent']
    );

    return sendSuccess(res, { schoolId: result.schoolId }, result.message);
  } catch (error) {
    console.error('Approve school error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function rejectSchool(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Only system administrators can reject schools' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const result = await approvalService.rejectSchool(id, reason, req.user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    await auditService.logResourceUpdate(
      req.user.userId,
      req.user.email,
      'school',
      result.schoolId || id,
      { action: 'rejected', approvalId: id, reason },
      req.ip || 'unknown',
      req.headers['user-agent']
    );

    return sendSuccess(res, { schoolId: result.schoolId }, result.message);
  } catch (error) {
    console.error('Reject school error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingApprovalCount(req: Request, res: Response) {
  try {
    const count = await approvalService.getPendingCount();
    return sendSuccess(res, count);
  } catch (error) {
    console.error('Get pending count error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
