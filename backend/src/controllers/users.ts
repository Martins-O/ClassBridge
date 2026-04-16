import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { userService } from '@/services';
import { serializeUser } from '@/lib/serializeUser';

export async function getUser(req: Request, res: Response) {
  try {
    await connectDB();

    const { id } = req.params;
    const user = await userService.getById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const payload = req.body;

    const requestingUser = await userService.getById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isSelfUpdate = userId === id;
    const isSystemAdmin = requestingUser.role === 'system_admin';
    const isSchoolAdminForUser = requestingUser.role === 'school_admin' && 
      (requestingUser.schoolId?.toString() === (await userService.getById(id))?.schoolId?.toString());

    if (!isSelfUpdate && !isSystemAdmin && !isSchoolAdminForUser) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const permittedFields: string[] = ['name', 'profileImage', 'phone', 'bio'];
    if (isSystemAdmin || isSchoolAdminForUser) {
      permittedFields.push('role', 'schoolId', 'classIds', 'isActive');
    }
    if (isSelfUpdate) {
      permittedFields.push('password');
    }

    const updates: any = {};
    for (const field of permittedFields) {
      if (payload[field] !== undefined) {
        updates[field] = payload[field];
      }
    }

    const updatedUser = await userService.update(id, updates);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'User updated successfully',
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPasswordStatus(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const requestingUser = await userService.getById(userId);
    
    if (!requestingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (requestingUser.role !== 'system_admin' && userId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const targetUser = await userService.getById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordChangedAt = targetUser.passwordChangedAt ? new Date(targetUser.passwordChangedAt) : new Date(targetUser.createdAt);
    const daysSinceChange = Math.floor((Date.now() - passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24));

    return res.json({
      success: true,
      passwordExpired: targetUser.passwordExpired || false,
      passwordChangedAt: passwordChangedAt.toISOString(),
      daysSinceChange,
      remindersSent: targetUser.remindersSent || 0,
      requirePasswordChange: targetUser.requirePasswordChange || false,
    });
  } catch (error) {
    console.error('Get password status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function forcePasswordChange(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestingUser = await userService.getById(userId);
    if (!requestingUser || requestingUser.role !== 'system_admin') {
      return res.status(403).json({ error: 'Only system admin can force password change' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const updated = await userService.forcePasswordChange(id, userId, reason);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'User will be required to change password on next login',
    });
  } catch (error) {
    console.error('Force password change error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestingUser = await userService.getById(userId);
    if (!requestingUser || requestingUser.role !== 'system_admin') {
      return res.status(403).json({ error: 'Only system admin can reset passwords' });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const tempPassword = await userService.resetPassword(id, newPassword);
    if (!tempPassword) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Password has been reset',
      tempPassword,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
