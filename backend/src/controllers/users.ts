import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { userService } from '@/services';
import { serializeUser } from '@/lib/serializeUser';
import User from '@/models/User';
import StudentInvitation from '@/models/StudentInvitation';
import MentorInvitation from '@/models/MentorInvitation';
import { sendEmail, generateStudentInvitationEmail, generateMentorInvitationEmail } from '@/lib/email';
import crypto from 'crypto';
import School from '@/models/School';

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

    const updatedUser = await userService.update(id, updates, requestingUser.role);

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

export async function inviteUser(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestingUser = await userService.getById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!['school_admin', 'system_admin'].includes(requestingUser.role)) {
      return res.status(403).json({ error: 'Only school administrators can invite users' });
    }

    const { name, email, role, schoolId } = req.body;

    if (!name || !email || !role || !schoolId) {
      return res.status(400).json({ error: 'Name, email, role, and school ID are required' });
    }

    if (!['student', 'mentor'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or mentor' });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (requestingUser.role === 'school_admin' && requestingUser.schoolId?.toString() !== schoolId) {
      return res.status(403).json({ error: 'You can only invite users to your own school' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.schoolId?.toString() === schoolId) {
        return res.status(400).json({ error: 'User already exists in this school' });
      }

      // Prevent changing system_admin role
      if (existingUser.role === 'system_admin') {
        return res.status(403).json({ error: 'Cannot change system admin role', code: 'CANNOT_MODIFY_SYSTEM_ADMIN' });
      }
      
      existingUser.role = role;
      existingUser.schoolId = schoolId;
      existingUser.isActive = true;
      await existingUser.save();
      return res.status(200).json({ message: 'User added to school', user: serializeUser(existingUser), isExistingUser: true });
    }

    const InvitationModel = role === 'mentor' ? MentorInvitation : StudentInvitation;
    const emailGenerator = role === 'mentor' ? generateMentorInvitationEmail : generateStudentInvitationEmail;

    const existingInvitation = await InvitationModel.findOne({
      email: email.toLowerCase(),
      schoolId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An active invitation already exists for this email' });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new InvitationModel({
      email: email.toLowerCase(),
      name,
      schoolId,
      invitedBy: userId,
      token,
      expiresAt
    });
    await invitation.save();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const invitationUrl = role === 'mentor' 
      ? `${baseUrl}/mentor-invitation/${token}`
      : `${baseUrl}/student-invitation/${token}`;

    if (role === 'mentor') {
      await sendEmail(generateMentorInvitationEmail({
        mentorEmail: email.toLowerCase(),
        mentorName: name,
        schoolName: school.name,
        invitationToken: token,
        inviterName: requestingUser.name
      }));
    } else {
      await sendEmail(generateStudentInvitationEmail({
        studentEmail: email.toLowerCase(),
        studentName: name,
        schoolName: school.name,
        className: '',
        invitationToken: token,
        inviterName: requestingUser.name
      }));
    }

    return res.status(201).json({ message: 'Invitation sent successfully', invitationId: invitation._id });
  } catch (error) {
    console.error('Invite user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deactivateUser(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestingUser = await userService.getById(userId);
    if (!requestingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;

    if (!['school_admin', 'system_admin'].includes(requestingUser.role)) {
      return res.status(403).json({ error: 'Only administrators can deactivate users' });
    }

    const targetUser = await userService.getById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (requestingUser.role === 'school_admin') {
      if (targetUser.schoolId?.toString() !== requestingUser.schoolId?.toString()) {
        return res.status(403).json({ error: 'You can only manage users in your school' });
      }
      if (targetUser.role === 'school_admin' || targetUser.role === 'system_admin') {
        return res.status(403).json({ error: 'Cannot deactivate administrators' });
      }
    }

    targetUser.isActive = false;
    await targetUser.save();

    return res.json({ message: 'User deactivated successfully', user: serializeUser(targetUser) });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function bulkImportUsers(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestingUser = await userService.getById(userId);
    if (!requestingUser || requestingUser.role !== 'school_admin') {
      return res.status(403).json({ error: 'Only school administrators can bulk import users' });
    }

    const schoolId = requestingUser.schoolId?.toString();
    if (!schoolId) {
      return res.status(400).json({ error: 'Your account is not associated with a school' });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Users array is required' });
    }

    const results: { success: Array<{ email: string; message: string }>; failed: Array<{ email: string; error: string }> } = {
      success: [],
      failed: []
    };

    for (const item of users) {
      const { name, email, role } = item;

      if (!name || !email || !role) {
        results.failed.push({ email: email || 'unknown', error: 'Missing required fields (name, email, role)' });
        continue;
      }

      if (!['student', 'mentor'].includes(role)) {
        results.failed.push({ email, error: 'Role must be student or mentor' });
        continue;
      }

      try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          if (existingUser.schoolId?.toString() === schoolId) {
            results.failed.push({ email, error: 'User already exists in this school' });
            continue;
          }
          existingUser.role = role;
          existingUser.schoolId = schoolId;
          existingUser.isActive = true;
          await existingUser.save();
          results.success.push({ email, message: 'User added to school' });
          continue;
        }

        const InvitationModel = role === 'mentor' ? MentorInvitation : StudentInvitation;
        const emailGenerator = role === 'mentor' ? generateMentorInvitationEmail : generateStudentInvitationEmail;

        const existingInvitation = await InvitationModel.findOne({
          email: email.toLowerCase(),
          schoolId,
          status: 'pending',
          expiresAt: { $gt: new Date() }
        });

        if (existingInvitation) {
          results.failed.push({ email, error: 'Invitation already exists' });
          continue;
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = new InvitationModel({
          email: email.toLowerCase(),
          name,
          schoolId,
          invitedBy: userId,
          token,
          expiresAt
        });
        await invitation.save();

        if (role === 'mentor') {
          await sendEmail(generateMentorInvitationEmail({
            mentorEmail: email.toLowerCase(),
            mentorName: name,
            schoolName: school.name,
            invitationToken: token,
            inviterName: requestingUser.name
          }));
        } else {
          await sendEmail(generateStudentInvitationEmail({
            studentEmail: email.toLowerCase(),
            studentName: name,
            schoolName: school.name,
            className: '',
            invitationToken: token,
            inviterName: requestingUser.name
          }));
        }

        results.success.push({ email, message: 'Invitation sent' });
      } catch (err) {
        results.failed.push({ email, error: 'Failed to process user' });
      }
    }

    return res.json({
      message: `Processed ${users.length} users`,
      results
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
