import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { userRepository } from '@/repositories';
import User from '@/models/User';
import ParentLink from '@/models/ParentLink';
import { gradeService } from '@/services';
import { classService } from '@/services';
import { notificationService } from '@/services';

export async function getMyChildren(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can access this' });
    }

    const links = await ParentLink.find({ parentId: userId, isActive: true }).populate('studentId', 'name email studentId role schoolId isActive');
    const children = links.map(link => ({
      _id: (link.studentId as any)._id?.toString(),
      name: (link.studentId as any).name,
      email: (link.studentId as any).email,
      studentId: (link.studentId as any).studentId,
      relationship: link.relationship,
      isPrimary: link.isPrimary,
    }));

    return res.json({ children });
  } catch (error) {
    console.error('Get my children error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addChild(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can add children' });
    }

    const { studentEmail, relationship, isPrimary } = req.body;
    if (!studentEmail) {
      return res.status(400).json({ error: 'Student email is required' });
    }

    const student = await User.findOne({ email: studentEmail.toLowerCase(), role: 'student' });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.schoolId?.toString() !== student.schoolId?.toString()) {
      return res.status(403).json({ error: 'Student must be from the same school' });
    }

    const existingLink = await ParentLink.findOne({ parentId: userId, studentId: student._id });
    if (existingLink) {
      return res.status(400).json({ error: 'Already linked to this student' });
    }

    const link = await ParentLink.create({
      parentId: userId,
      studentId: student._id,
      relationship: relationship || 'guardian',
      isPrimary: isPrimary || false,
      isActive: true,
    });

    await notificationService.create({
      userId: student._id.toString(),
      title: 'Parent/Guardian Linked',
      message: `${user.name} has been added as your ${link.relationship}`,
      type: 'info',
    });

    return res.status(201).json({ message: 'Child added successfully', link });
  } catch (error) {
    console.error('Add child error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeChild(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can remove children' });
    }

    const { studentId } = req.params;
    const result = await ParentLink.updateOne({ parentId: userId, studentId }, { isActive: false });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    return res.json({ message: 'Child removed successfully' });
  } catch (error) {
    console.error('Remove child error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getChildGrades(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can access this' });
    }

    const { studentId } = req.params;
    const link = await ParentLink.findOne({ parentId: userId, studentId, isActive: true });
    if (!link) {
      return res.status(403).json({ error: 'You do not have access to this student' });
    }

    const { grades, total } = await gradeService.getAll(studentId, 'parent', 1, 100);
    return res.json({ grades, total });
  } catch (error) {
    console.error('Get child grades error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getChildClasses(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can access this' });
    }

    const { studentId } = req.params;
    const link = await ParentLink.findOne({ parentId: userId, studentId, isActive: true });
    if (!link) {
      return res.status(403).json({ error: 'You do not have access to this student' });
    }

    const { classes, total } = await classService.getAll(studentId, 'student', user.schoolId?.toString(), 1, 100);
    return res.json({ classes, total });
  } catch (error) {
    console.error('Get child classes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
