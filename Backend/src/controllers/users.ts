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
    const isSuperAdmin = requestingUser.role === 'super_admin';
    const isSchoolAdminForUser = requestingUser.role === 'school_admin' && 
      (requestingUser.schoolId?.toString() === (await userService.getById(id))?.schoolId?.toString());

    if (!isSelfUpdate && !isSuperAdmin && !isSchoolAdminForUser) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const permittedFields: string[] = ['name', 'profileImage', 'phone', 'bio'];
    if (isSuperAdmin || isSchoolAdminForUser) {
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
