import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { getPaginationParams, paginate } from '@/lib/pagination';
import { whitelistFields } from '@/lib/fieldUtils';
import { userRepository } from '@/repositories';
import { gradeService } from '@/services';

const UPDATE_ALLOWED_FIELDS = ['points', 'maxPoints', 'comments', 'status'];
const BULK_CREATE_ALLOWED_FIELDS = ['studentId', 'courseId', 'classId', 'mentorId', 'academicYear', 'semester', 'grade', 'score', 'comments'];

export async function getGrades(req: Request, res: Response) {
  try {
    await connectDB();

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { page, limit } = getPaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
    const result = await gradeService.getAll(payload.userId, user.role, page, limit);

    const response = paginate(result.grades, result.total, page, limit);
    return res.json(response);
  } catch (error) {
    console.error('Get grades error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createGrade(req: Request, res: Response) {
  try {
    await connectDB();

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'student') {
      return res.status(403).json({ error: 'Students cannot create grades' });
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
      mentorId: payload.userId,
      academicYear,
      semester,
      grade,
      score,
      comments,
    }, payload.userId, user.role);

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

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const body = req.body;
    const allowedUpdates = whitelistFields(body, UPDATE_ALLOWED_FIELDS);

    const grade = await gradeService.update(
      id, 
      allowedUpdates, 
      payload.userId, 
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

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    await gradeService.delete(
      id, 
      payload.userId, 
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

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);
    
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
      mentorId: payload.userId,
    }));

    const createdGrades = await gradeService.createBulk(gradesWithMentor, payload.userId, user.role);

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
