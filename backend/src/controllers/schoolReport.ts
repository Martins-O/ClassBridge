import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import ClassModel from '../models/Class';
import Course from '../models/Course';
import AuditLog from '../models/AuditLog';
import School from '../models/School';
import { isSystemAdmin, isSchoolAdmin } from '@/lib/permissions';

export async function getSchoolReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    if (!isSystemAdmin(user.role) && (!isSchoolAdmin(user.role) || user.schoolId !== id)) {
      return res.status(403).json({ error: 'Access denied to this school' });
    }

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const [totalStudents, totalMentors, totalClasses, totalCourses, activeUsers, allUsers] = await Promise.all([
      User.countDocuments({ schoolId: id, role: 'student' }),
      User.countDocuments({ schoolId: id, role: 'mentor' }),
      ClassModel.countDocuments({ schoolId: id }),
      Course.countDocuments({ schoolId: id }),
      User.countDocuments({ schoolId: id, isActive: true }),
      User.find({ schoolId: id }).lean(),
    ]);

    const activeStudents = allUsers.filter(u => u.role === 'student' && u.isActive).length;
    const activeMentors = allUsers.filter(u => u.role === 'mentor' && u.isActive).length;

    const byRole: Record<string, number> = {};
    allUsers.forEach(user => {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
    });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentLogs, totalLogins] = await Promise.all([
      AuditLog.find({ resourceId: id })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean(),
      AuditLog.countDocuments({
        resourceId: id,
        action: 'login',
        timestamp: { $gte: oneWeekAgo }
      }),
    ]);

    const totalActions = recentLogs.length;

    const byAction: Record<string, number> = {};
    recentLogs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });

    return res.json({
      success: true,
      schoolId: id,
      schoolName: school.name,
      totalStudents,
      totalMentors,
      totalClasses,
      totalCourses,
      activeStudents,
      activeMentors,
      totalLogins,
      totalActions,
      byRole,
      byAction,
      recentActivity: recentLogs.map(log => ({
        _id: log._id.toString(),
        userId: log.userId,
        userEmail: log.userEmail,
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp,
      })),
    });
  } catch (error) {
    console.error('Get school report error:', error);
    return res.status(500).json({ error: 'Failed to get school report' });
  }
}

export async function getSchoolActivity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const user = (req as any).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    if (!isSystemAdmin(user.role) && (!isSchoolAdmin(user.role) || user.schoolId !== id)) {
      return res.status(403).json({ error: 'Access denied to this school' });
    }

    const dateFilter: any = {};
    if (startDate) dateFilter.timestamp = { $gte: new Date(startDate as string) };
    if (endDate) dateFilter.timestamp = { ...dateFilter.timestamp, $lte: new Date(endDate as string) };

    const users = await User.find({ schoolId: id }).select('_id').lean();
    const userIds = users.map(u => u._id);

    const logs = await AuditLog.find({
      ...dateFilter,
      userId: { $in: userIds }
    }).lean();

    const totalLogins = logs.filter(l => l.action === 'login').length;
    const totalActions = logs.length;

    const byAction: Record<string, number> = {};
    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });

    return res.json({
      success: true,
      totalLogins,
      totalActions,
      byAction,
    });
  } catch (error) {
    console.error('Get school activity error:', error);
    return res.status(500).json({ error: 'Failed to get school activity' });
  }
}

export async function exportSchoolAuditCsv(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    if (!isSystemAdmin(user.role) && (!isSchoolAdmin(user.role) || user.schoolId !== id)) {
      return res.status(403).json({ error: 'Access denied to this school' });
    }

    const users = await User.find({ schoolId: id }).select('_id').lean();
    const userIds = users.map(u => u._id);

    const logs = await AuditLog.find({ userId: { $in: userIds } })
      .sort({ timestamp: -1 })
      .limit(1000)
      .lean();

    const csvHeader = 'Timestamp,User Email,Action,Resource,Resource ID\n';
    const csvRows = logs.map(log =>
      `"${log.timestamp}","${log.userEmail}","${log.action}","${log.resource}","${log.resourceId || ''}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=school-audit-${id}.csv`);
    return res.send(csvHeader + csvRows);
  } catch (error) {
    console.error('Export school audit error:', error);
    return res.status(500).json({ error: 'Failed to export school audit' });
  }
}
