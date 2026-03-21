import { Request, Response } from 'express';
import { deletionService } from '@/services/deletion.service';
import { AuthRequest } from '@/lib/authorization';
import { canRequestDelete, canApproveDelete } from '@/lib/permissions';
import { UserRole } from '@/models/User';

export async function requestDeletion(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!canRequestDelete(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'You do not have permission to request deletions' });
    }

    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.user.schoolId) {
      return res.status(403).json({ error: 'No school associated with your account' });
    }

    const result = await deletionService.requestDeletion({
      userId,
      requestedBy: req.user.userId,
      schoolId: req.user.schoolId,
      reason,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.status(201).json({
      message: result.message,
      requestId: result.requestId,
    });
  } catch (error) {
    console.error('Request deletion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingDeletionRequests(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.schoolId) {
      return res.status(403).json({ error: 'No school associated with your account' });
    }

    const requests = await deletionService.getPendingRequests(req.user.schoolId);
    return res.json({ requests });
  } catch (error) {
    console.error('Get pending deletion requests error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllDeletionRequests(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!canApproveDelete(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'You do not have permission to view deletion requests' });
    }

    if (!req.user.schoolId) {
      return res.status(403).json({ error: 'No school associated with your account' });
    }

    const requests = await deletionService.getRequestsForSchool(req.user.schoolId);
    return res.json({ requests });
  } catch (error) {
    console.error('Get all deletion requests error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDeletionRequestById(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const request = await deletionService.getRequestById(id);

    if (!request) {
      return res.status(404).json({ error: 'Deletion request not found' });
    }

    if (request.schoolId.toString() !== req.user.schoolId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ request });
  } catch (error) {
    console.error('Get deletion request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveDeletionRequest(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!canApproveDelete(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'You do not have permission to approve deletions' });
    }

    const { id } = req.params;

    const result = await deletionService.approveDeletion(id, req.user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error('Approve deletion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function rejectDeletionRequest(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!canApproveDelete(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'You do not have permission to reject deletions' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const result = await deletionService.rejectDeletion(id, reason, req.user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error('Reject deletion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancelDeletionRequest(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const result = await deletionService.cancelRequest(id, req.user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error('Cancel deletion request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingDeletionCount(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.schoolId) {
      return res.status(403).json({ error: 'No school associated with your account' });
    }

    const count = await deletionService.getPendingCount(req.user.schoolId);
    return res.json({ count });
  } catch (error) {
    console.error('Get pending deletion count error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
