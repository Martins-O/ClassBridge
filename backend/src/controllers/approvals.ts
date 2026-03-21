import { Request, Response } from 'express';
import { approvalService } from '@/services/approval.service';
import { requireSystemAdmin } from '@/lib/authorization';
import { AuthRequest } from '@/lib/authorization';

export async function requestSchool(req: Request, res: Response) {
  try {
    const { name, email, phone, address, website, description, adminEmail, adminName, adminPassword } = req.body;

    if (!name || !email || !adminEmail || !adminName || !adminPassword) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, adminEmail, adminName, adminPassword are required'
      });
    }

    if (adminPassword.length < 8) {
      return res.status(400).json({
        error: 'Admin password must be at least 8 characters'
      });
    }

    const result = await approvalService.requestSchool({
      name,
      email,
      phone,
      address,
      website,
      description,
      adminEmail,
      adminName,
      adminPassword,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.status(201).json({
      message: result.message,
      schoolId: result.schoolId,
      approvalId: result.approvalId,
    });
  } catch (error) {
    console.error('Request school error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingApprovals(req: Request, res: Response) {
  try {
    const approvals = await approvalService.getPendingApprovals();
    return res.json({ approvals });
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

    return res.json({ approval });
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
    return res.json({ requests });
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

    return res.json({
      message: result.message,
      schoolId: result.schoolId,
    });
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

    return res.json({
      message: result.message,
      schoolId: result.schoolId,
    });
  } catch (error) {
    console.error('Reject school error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingApprovalCount(req: Request, res: Response) {
  try {
    const count = await approvalService.getPendingCount();
    return res.json({ count });
  } catch (error) {
    console.error('Get pending count error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
