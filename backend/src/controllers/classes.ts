import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import { getPaginationParams, buildPagination } from '@/lib/pagination';
import { userRepository } from '@/repositories';
import { classService } from '@/services';

function getSchoolId(doc: any): string | undefined {
  const school = doc.schoolId?._id || doc.schoolId;
  return school?.toString();
}

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
    schoolId: getSchoolId(classDoc),
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

function canAccessClass(user: any, cls: any): boolean {
  if (user.role === 'system_admin') return true;
  if (user.role === 'school_admin' && user.schoolId?.toString() === getSchoolId(cls)) return true;
  const classMentorIds = (cls.mentorIds || []).map((m: any) => m._id?.toString() || m.toString());
  if (user.role === 'mentor' && classMentorIds.includes(user._id.toString())) return true;
  const classStudentIds = (cls.studentIds || []).map((s: any) => s._id?.toString() || s.toString());
  if (user.role === 'student' && classStudentIds.includes(user._id.toString())) return true;
  return false;
}

function canManageClass(user: any, cls: any): boolean {
  if (user.role === 'system_admin') return true;
  if (user.role === 'school_admin' && user.schoolId?.toString() === getSchoolId(cls)) return true;
  return false;
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

    const response = buildPagination(formattedClasses, result.total, page, limit);
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

    if (!['school_admin', 'system_admin'].includes(user.role)) {
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

    const canAccess = canAccessClass(user, cls);
    if (!canAccess) {
      return res.status(403).json({ error: 'You do not have access to this class' });
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

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const cls = await classService.getById(id);

    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (!canAccessClass(user, cls)) {
      return res.status(403).json({ error: 'You do not have access to this class' });
    }

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

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }

    const cls = await classService.getById(id);
    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (!canManageClass(user, cls)) {
      return res.status(403).json({ error: 'Only administrators can add students to classes' });
    }

    const updatedClass = await classService.addStudents(id, studentIds);

    return res.json({
      message: 'Students added successfully',
      class: formatClassDocument(updatedClass),
    });
  } catch (error) {
    console.error('Add student to class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteClass(req: Request, res: Response) {
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

    if (!canManageClass(user, cls)) {
      return res.status(403).json({ error: 'Only administrators can delete classes' });
    }

    await classService.deleteWithCascade(id);

    return res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
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

    const response = buildPagination(formattedClasses, result.total, page, limit);
    return res.json(response);
  } catch (error) {
    console.error('Get classes for user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
