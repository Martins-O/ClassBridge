import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { getPaginationParams, buildPagination } from '@/lib/pagination';
import { whitelistFields } from '@/lib/fieldUtils';
import { userRepository } from '@/repositories';
import { gradeService } from '@/services';
import { hasPermission, canViewOwnGradesOnly, canViewAllGrades } from '@/lib/permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { UserRole } from '@/models/User';

const UPDATE_ALLOWED_FIELDS = ['points', 'maxPoints', 'comments', 'status'];
const BULK_CREATE_ALLOWED_FIELDS = ['studentId', 'courseId', 'classId', 'mentorId', 'academicYear', 'semester', 'grade', 'score', 'comments'];

export async function getGrades(req: Request, res: Response) {
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
    const result = await gradeService.getAll(userId, user.role, page, limit);

    const response = buildPagination(result.grades, result.total, page, limit);
    return res.json(response);
  } catch (error) {
    console.error('Get grades error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createGrade(req: Request, res: Response) {
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

    if (!hasPermission(user.role as UserRole, PERMISSIONS.GRADE_STUDENTS)) {
      return res.status(403).json({ error: 'Permission denied: GRADE_STUDENTS required' });
    }

    const body = req.body;
    const { studentId, courseId, classId, academicYear, semester, grade, score, comments } = body;

    if (!studentId || !courseId || !classId || !academicYear || !grade) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const gradeRecord = await gradeService.create({
      studentId,
      courseId,
      classId,
      mentorId: userId,
      academicYear,
      semester,
      grade,
      score,
      comments,
    }, userId, user.role);

    return res.status(201).json({
      message: 'Grade created successfully',
      grade: gradeRecord,
    });
  } catch (error) {
    console.error('Create grade error:', error);
    if (error instanceof Error) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getGrade(req: Request, res: Response) {
  try {
    await connectDB();

    const { id } = req.params;
    const grade = await gradeService.getById(id);

    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    return res.json({ grade });
  } catch (error) {
    console.error('Get grade error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateGrade(req: Request, res: Response) {
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

    const { id } = req.params;
    const body = req.body;
    const allowedUpdates = whitelistFields(body, UPDATE_ALLOWED_FIELDS);

    const grade = await gradeService.update(
      id, 
      allowedUpdates, 
      userId, 
      user.role,
      user.schoolId?.toString()
    );

    return res.json({
      message: 'Grade updated successfully',
      grade,
    });
  } catch (error) {
    console.error('Update grade error:', error);
    if (error instanceof Error) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteGrade(req: Request, res: Response) {
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

    const { id } = req.params;
    await gradeService.delete(
      id, 
      userId, 
      user.role,
      user.schoolId?.toString()
    );

    return res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    if (error instanceof Error) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function bulkCreateGrades(req: Request, res: Response) {
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

    if (user.role === 'student') {
      return res.status(403).json({ error: 'Students cannot create grades' });
    }

    const { grades } = req.body;

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ error: 'Grades array is required' });
    }

    const gradesWithMentor = grades.map((g: any) => ({
      ...whitelistFields(g, BULK_CREATE_ALLOWED_FIELDS),
      mentorId: userId,
    }));

    const createdGrades = await gradeService.createBulk(gradesWithMentor, userId, user.role);

    return res.status(201).json({
      message: `Successfully created ${createdGrades.length} grades`,
      grades: createdGrades,
    });
  } catch (error) {
    console.error('Bulk create grades error:', error);
    if (error instanceof Error) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
