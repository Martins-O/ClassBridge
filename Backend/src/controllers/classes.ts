import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import School from '@/models/School';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

type PopulatedReference = {
  _id: { toString(): string };
  name?: string;
  email?: string;
  studentId?: string;
  isActive?: boolean;
};

type PopulatedClassDoc = {
  _id: { toString(): string };
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  academicYear: string;
  semester?: string;
  cohort?: string;
  duration?: string;
  schoolId?: { toString(): string };
  mentorIds?: PopulatedReference[];
  studentIds?: PopulatedReference[];
  isActive?: boolean;
  maxStudents?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

function formatClassDocument(classDoc: PopulatedClassDoc) {
  return {
    _id: classDoc._id.toString(),
    id: classDoc._id.toString(),
    name: classDoc.name,
    description: classDoc.description,
    subject: classDoc.subject,
    grade: classDoc.grade,
    academicYear: classDoc.academicYear,
    semester: classDoc.semester,
    cohort: classDoc.cohort,
    duration: classDoc.duration,
    schoolId: classDoc.schoolId?.toString(),
    mentorIds: (classDoc.mentorIds || []).map((mentor) => mentor._id.toString()),
    mentors: (classDoc.mentorIds || []).map((mentor) => ({
      _id: mentor._id.toString(),
      id: mentor._id.toString(),
      name: mentor.name,
      email: mentor.email,
    })),
    studentIds: (classDoc.studentIds || []).map((student) => student._id.toString()),
    students: (classDoc.studentIds || []).map((student) => ({
      _id: student._id.toString(),
      id: student._id.toString(),
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let classes: unknown[];

    if (user.role === 'super_admin') {
      classes = await Class.find()
        .populate('mentorIds', 'name email')
        .populate('studentIds', 'name email studentId isActive')
        .lean();
    } else if (user.role === 'school_admin') {
      classes = await Class.find({ schoolId: user.schoolId })
        .populate('mentorIds', 'name email')
        .populate('studentIds', 'name email studentId isActive')
        .lean();
    } else if (user.role === 'mentor') {
      classes = await Class.find({ mentorIds: userId })
        .populate('mentorIds', 'name email')
        .populate('studentIds', 'name email studentId isActive')
        .lean();
    } else if (user.role === 'student') {
      classes = await Class.find({ studentIds: userId })
        .populate('mentorIds', 'name email')
        .populate('studentIds', 'name email studentId isActive')
        .lean();
    } else {
      classes = [];
    }

    const formattedClasses = classes.map((classDoc) => formatClassDocument(classDoc as PopulatedClassDoc));

    return res.json({ classes: formattedClasses });
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

    const user = await User.findById(userId);
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

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (user.role === 'school_admin' && user.schoolId?.toString() !== schoolId) {
      return res.status(403).json({ error: 'You can only create classes for your own school' });
    }

    const newClass = new Class({
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
    });

    await newClass.save();
    await newClass.populate(['mentorIds', 'studentIds']);

    return res.status(201).json({
      message: 'Class created successfully',
      class: newClass,
    });
  } catch (error) {
    console.error('Create class error:', error);
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return res.status(400).json({ error: 'Invalid class data provided' });
      }
      if (error.message.includes('duplicate key')) {
        return res.status(409).json({ error: 'A class with this name already exists' });
      }
    }
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const classData = await Class.findById(id).populate(['mentorIds', 'studentIds', 'schoolId']);

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    let hasAccess = false;

    if (user.role === 'super_admin') {
      hasAccess = true;
    } else if (user.role === 'school_admin') {
      hasAccess = (classData.schoolId as unknown as { _id: { toString(): string } })?._id?.toString() === user.schoolId?.toString();
    } else if (user.role === 'mentor') {
      hasAccess = (classData.mentorIds as unknown as { _id: { toString(): string } }[]).some((m) => m._id?.toString() === userId);
    } else if (user.role === 'student') {
      hasAccess = (classData.studentIds as unknown as { _id: { toString(): string } }[]).some((s) => s._id.toString() === userId);
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ class: classData });
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const existingClass = await Class.findById(id);

    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    let hasAccess = false;

    if (user.role === 'super_admin') {
      hasAccess = true;
    } else if (user.role === 'school_admin') {
      hasAccess = existingClass.schoolId.toString() === user.schoolId?.toString();
    } else {
      return res.status(403).json({ error: 'Only administrators can update classes' });
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const body = req.body;
    const { isActive, ...otherUpdates } = body;

    const updates: Record<string, unknown> = { ...otherUpdates };
    if (typeof isActive === 'boolean') {
      updates.isActive = isActive;
    }

    const updatedClass = await Class.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).populate(['mentorIds', 'studentIds', 'schoolId']);

    if (!updatedClass) {
      return res.status(500).json({ error: 'Failed to update class' });
    }

    return res.json({
      message: 'Class updated successfully',
      class: updatedClass,
    });
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

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const classDoc = await Class.findById(id).populate('studentIds', 'name email studentId isActive');

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    let hasAccess = false;

    switch (currentUser.role) {
      case 'super_admin':
        hasAccess = true;
        break;
      case 'school_admin':
        hasAccess = classDoc.schoolId?.toString() === currentUser.schoolId?.toString();
        break;
      case 'mentor':
        hasAccess = (classDoc.mentorIds as unknown as { toString(): string }[]).some((m) => m.toString() === userId);
        break;
      case 'student':
        hasAccess = (classDoc.studentIds as unknown as { _id: { toString(): string } }[]).some((s) => s._id.toString() === userId);
        break;
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const students = (classDoc.studentIds as unknown as { _id: string; name: string; email: string; studentId?: string; isActive?: boolean }[]).map((student) => ({
      id: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      isActive: student.isActive,
    }));

    return res.json({ students });
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

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }

    const classDoc = await Class.findById(id);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    let hasAccess = false;
    if (currentUser.role === 'super_admin' || currentUser.role === 'school_admin') {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newStudentIds = studentIds.filter((sid: string) => !classDoc.studentIds.map((s: any) => s.toString()).includes(sid));
    classDoc.studentIds.push(...newStudentIds);
    await classDoc.save();

    await classDoc.populate('studentIds', 'name email studentId isActive');

    return res.json({
      message: 'Students added successfully',
      class: classDoc,
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let classes: unknown[];

    if (user.role === 'super_admin') {
      classes = await Class.find().populate('mentorIds', 'name email').populate('studentIds', 'name email studentId isActive').lean();
    } else if (user.role === 'school_admin') {
      classes = await Class.find({ schoolId: user.schoolId }).populate('mentorIds', 'name email').populate('studentIds', 'name email studentId isActive').lean();
    } else if (user.role === 'mentor') {
      classes = await Class.find({ mentorIds: userId }).populate('mentorIds', 'name email').populate('studentIds', 'name email studentId isActive').lean();
    } else if (user.role === 'student') {
      classes = await Class.find({ studentIds: userId }).populate('mentorIds', 'name email').populate('studentIds', 'name email studentId isActive').lean();
    } else {
      classes = [];
    }

    const formattedClasses = classes.map((classDoc) => formatClassDocument(classDoc as PopulatedClassDoc));

    return res.json({ classes: formattedClasses });
  } catch (error) {
    console.error('Get classes for user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
