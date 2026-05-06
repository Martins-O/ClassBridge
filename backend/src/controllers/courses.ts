import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { getPaginationParams, buildPagination } from '@/lib/pagination';
import { userRepository } from '@/repositories';
import { courseService } from '@/services';

export async function getCourses(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { page, limit } = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
    const result = await courseService.getAll(userId, user.role, user.schoolId?.toString(), page, limit);

    const response = buildPagination(result.courses, result.total, page, limit);
    return res.json(response);
  } catch (error) {
    console.error('Get courses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createCourse(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!['mentor', 'system_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only mentors can create courses' });
    }

    const body = req.body;
    const { name, description, classId, subject, duration, startDate, endDate, maxStudents = 30, syllabus } = body;

    try {
      const course = await courseService.create({
        name,
        description,
        classId,
        mentorId: userId,
        subject,
        duration,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        maxStudents,
        syllabus,
      }, user.role);

      return res.status(201).json({
        message: 'Course created successfully',
        course,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCourseById(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const course = await courseService.getById(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.json({ course });
  } catch (error) {
    console.error('Get course by id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCourse(req: Request, res: Response) {
  try {
    await connectDB();

    const { id } = req.params;
    const body = req.body;

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const course = await courseService.update(
      id,
      body,
      userId,
      user.role,
      user.schoolId?.toString()
    );

    return res.json({ message: 'Course updated', course });
  } catch (error) {
    console.error('Update course error:', error);
    if (error instanceof Error) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCourse(req: Request, res: Response) {
  try {
    await connectDB();

    const { id } = req.params;

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await courseService.delete(
      id,
      userId,
      user.role,
      user.schoolId?.toString()
    );

    return res.json({ message: 'Course archived' });
  } catch (error) {
    console.error('Delete course error:', error);
    if (error instanceof Error) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
