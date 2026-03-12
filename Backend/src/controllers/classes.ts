import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { getPaginationParams, paginate } from '@/lib/pagination';
import { userRepository } from '@/repositories';
import { classService } from '@/services';

function formatClassDocument(classDoc: any) {
  return {
    _id: classDoc._id?.toString(),
    id: classDoc._id?.toString(),
    name: classDoc.name,
    description: classDoc.description,
    subject: classDoc.subject,
    grade: classDoc.grade,
    academicYear: classDoc.academicYear,
    semester: classDoc.semester,
    cohort: classDoc.cohort,
    duration: classDoc.duration,
    schoolId: classDoc.schoolId?.toString(),
    mentorIds: classDoc.mentorIds?.map((mentor: any) => mentor._id?.toString() || mentor.toString()),
    mentors: classDoc.mentorIds?.map((mentor: any) => ({
      _id: mentor._id?.toString(),
      id: mentor._id?.toString(),
      name: mentor.name,
      email: mentor.email,
    })),
    studentIds: classDoc.studentIds?.map((student: any) => student._id?.toString() || student.toString()),
    students: classDoc.studentIds?.map((student: any) => ({
      _id: student._id?.toString(),
      id: student._id?.toString(),
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      isActive: student.isActive,
    })),
    isActive: classDoc.isActive,
    maxStudents: classDoc.maxStudents,
    createdAt: classDoc.createdAt,
    updatedAt: classDoc.updatedAt,
  };
}

export async function getClasses(req: Request, res: Response) {
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
    const result = await classService.getAll(userId, user.role, user.schoolId?.toString(), page, limit);
    const formattedClasses = result.classes.map(formatClassDocument);

    const response = paginate(formattedClasses, result.total, page, limit);
    return res.json(response);
  } catch (error) {
    console.error('Get classes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createClass(req: Request, res: Response) {
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

    if (!['school_admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can create classes' });
    }

    const body = req.body;
    const { name, description, schoolId, mentorIds = [], studentIds = [], subject, grade, academicYear, semester, maxStudents, duration, cohort } = body;

    if (!name || !schoolId || !academicYear || !duration || !cohort) {
      return res.status(400).json({ error: 'Name, school ID, academic year, duration, and cohort are required' });
    }

    try {
      const cls = await classService.create({
        name,
        description,
        schoolId,
        mentorIds,
        studentIds,
        subject,
        grade,
        academicYear,
        semester,
        maxStudents,
        duration,
        cohort,
      }, user.role, user.schoolId?.toString());

      return res.status(201).json({
        message: 'Class created successfully',
        class: formatClassDocument(cls),
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Create class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getClassById(req: Request, res: Response) {
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
    const cls = await classService.getById(id);

    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    return res.json({ class: formatClassDocument(cls) });
  } catch (error) {
    console.error('Get class by id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateClass(req: Request, res: Response) {
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

    try {
      const cls = await classService.update(id, body, user.role, user.schoolId?.toString());

      return res.json({
        message: 'Class updated successfully',
        class: formatClassDocument(cls),
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Update class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getClassStudents(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const students = await classService.getStudents(id);

    const formattedStudents = students.map((student: any) => ({
      id: student._id?.toString(),
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      isActive: student.isActive,
    }));

    return res.json({ students: formattedStudents });
  } catch (error) {
    console.error('Get class students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addStudentToClass(req: Request, res: Response) {
  try {
    await connectDB();

    const { id } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }

    const cls = await classService.addStudents(id, studentIds);

    return res.json({
      message: 'Students added successfully',
      class: formatClassDocument(cls),
    });
  } catch (error) {
    console.error('Add student to class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getClassesForUser(req: Request, res: Response) {
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
    const result = await classService.getAll(userId, user.role, user.schoolId?.toString(), page, limit);
    const formattedClasses = result.classes.map(formatClassDocument);

    const response = paginate(formattedClasses, result.total, page, limit);
    return res.json(response);
  } catch (error) {
    console.error('Get classes for user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
