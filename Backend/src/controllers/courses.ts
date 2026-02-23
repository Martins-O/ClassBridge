import { Request, Response } from 'express';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Class from '@/models/Class';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';
import {
  ValidationResult,
  validateString,
  validateObjectId,
  validateEnum,
  validateNumber,
} from '@/lib/validation';

const allowedDurations = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months'];

type MaybeObjectId = string | Types.ObjectId | null | undefined;

interface CourseReference {
  mentorId?: MaybeObjectId;
  classId?: MaybeObjectId | { _id?: MaybeObjectId };
}

interface UserReference {
  _id: MaybeObjectId;
  role: string;
  schoolId?: MaybeObjectId;
}

const isObjectIdEqual = (a: MaybeObjectId, b: MaybeObjectId): boolean => {
  if (!a || !b) return false;
  const left = typeof a === 'string' ? a : (a as Types.ObjectId).toString();
  const right = typeof b === 'string' ? b : (b as Types.ObjectId).toString();
  return left === right;
};

const isCourseOwner = (userId: string, course: CourseReference): boolean => {
  if (!course?.mentorId) return false;
  return isObjectIdEqual(course.mentorId, userId);
};

async function ensureAuthorised(user: UserReference | null, course: CourseReference): Promise<boolean> {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'mentor' && user._id && isCourseOwner(user._id.toString(), course)) return true;

  if (user.role === 'school_admin') {
    const rawClassId = course?.classId;
    const classId = typeof rawClassId === 'object' && rawClassId ? (rawClassId as { _id?: MaybeObjectId })._id : rawClassId;
    if (!classId) return false;
    const courseClass = await Class.findById(classId).lean() as { schoolId: MaybeObjectId } | null;
    if (!courseClass) return false;
    return isObjectIdEqual(courseClass.schoolId, user.schoolId);
  }

  return false;
}

export async function getCourses(req: Request, res: Response) {
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

    let courses: unknown[];

    if (user.role === 'super_admin') {
      courses = await Course.find()
        .populate('classId', 'name academicYear')
        .populate('mentorId', 'name email')
        .populate('studentIds', 'name email')
        .lean();
    } else if (user.role === 'school_admin') {
      const schoolClasses = await Class.find({ schoolId: user.schoolId });
      const classIds = schoolClasses.map((cls) => cls._id);

      courses = await Course.find({ classId: { $in: classIds } })
        .populate('classId', 'name academicYear')
        .populate('mentorId', 'name email')
        .populate('studentIds', 'name email')
        .lean();
    } else if (user.role === 'mentor') {
      courses = await Course.find({ mentorId: userId })
        .populate('classId', 'name academicYear')
        .populate('mentorId', 'name email')
        .populate('studentIds', 'name email')
        .lean();
    } else if (user.role === 'student') {
      courses = await Course.find({ studentIds: userId })
        .populate('classId', 'name academicYear')
        .populate('mentorId', 'name email')
        .populate('studentIds', 'name email')
        .lean();
    } else {
      courses = [];
    }

    return res.json({ courses });
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!['mentor', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only mentors can create courses' });
    }

    const body = req.body;
    const { name, description, classId, subject, duration, startDate, endDate, maxStudents = 30, syllabus } = body;

    const validation = new ValidationResult();
    validation.errors.push(...validateString(name, 'name', { required: true, minLength: 3, maxLength: 100 }));
    validation.errors.push(...validateObjectId(classId, 'classId'));
    validation.errors.push(...validateEnum(duration, 'duration', ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months']));

    if (maxStudents) {
      validation.errors.push(...validateNumber(maxStudents, 'maxStudents', { min: 1, max: 100, integer: true }));
    }

    if (!validation.isValid()) {
      return res.status(400).json(validation.getResponse());
    }

    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (user.role === 'mentor' && !(classExists.mentorIds as unknown as string[]).includes(userId)) {
      return res.status(403).json({ error: 'You can only create courses for classes you are assigned to' });
    }

    const newCourse = new Course({
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
    });

    await newCourse.save();
    await newCourse.populate(['classId', 'mentorId']);

    return res.status(201).json({
      message: 'Course created successfully',
      course: newCourse,
    });
  } catch (error) {
    console.error('Create course error:', error);
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return res.status(400).json({ error: 'Invalid course data provided' });
      }
      if (error.message.includes('duplicate key')) {
        return res.status(409).json({ error: 'A course with this name already exists in this class' });
      }
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCourse(req: Request, res: Response) {
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
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const userRef = user as unknown as UserReference;
    const courseRef = course as unknown as CourseReference;

    if (!(await ensureAuthorised(userRef, courseRef))) {
      return res.status(403).json({ error: 'You are not authorised to update this course' });
    }

    const body = req.body;
    const { name, description, classId, subject, duration, startDate, endDate, maxStudents, syllabus, isActive } = body;

    const validation = new ValidationResult();

    if (typeof name !== 'undefined') {
      validation.errors.push(...validateString(name, 'name', { required: true, minLength: 3, maxLength: 100 }));
    }
    if (typeof description !== 'undefined') {
      validation.errors.push(...validateString(description, 'description', { required: false, maxLength: 500 }));
    }
    if (typeof subject !== 'undefined') {
      validation.errors.push(...validateString(subject, 'subject', { required: false, maxLength: 50 }));
    }
    if (typeof syllabus !== 'undefined') {
      validation.errors.push(...validateString(syllabus, 'syllabus'));
    }
    if (typeof classId !== 'undefined') {
      validation.errors.push(...validateObjectId(classId, 'classId'));
    }
    if (typeof duration !== 'undefined') {
      validation.errors.push(...validateEnum(duration, 'duration', allowedDurations));
    }
    if (typeof maxStudents !== 'undefined') {
      validation.errors.push(...validateNumber(maxStudents, 'maxStudents', { min: 1, max: 100, integer: true }));
    }

    if (!validation.isValid()) {
      return res.status(400).json(validation.getResponse());
    }

    if (classId && !isObjectIdEqual(course.classId as MaybeObjectId, classId)) {
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({ error: 'Class not found' });
      }
      if (userRef.role === 'mentor' && !(classDoc.mentorIds as unknown as string[]).includes(user._id.toString())) {
        return res.status(403).json({ error: 'You can only assign courses to your own classes' });
      }
      course.classId = classDoc._id;
    }

    if (typeof name !== 'undefined') course.name = name;
    if (typeof description !== 'undefined') course.description = description;
    if (typeof subject !== 'undefined') course.subject = subject;
    if (typeof duration !== 'undefined') course.duration = duration;
    if (typeof syllabus !== 'undefined') course.syllabus = syllabus;
    if (typeof maxStudents !== 'undefined') course.maxStudents = maxStudents;
    if (typeof startDate !== 'undefined') {
      course.startDate = startDate ? new Date(startDate) : undefined;
    }
    if (typeof endDate !== 'undefined') {
      course.endDate = endDate ? new Date(endDate) : undefined;
    }
    if (typeof isActive !== 'undefined') {
      course.isActive = Boolean(isActive);
    }

    await course.save();
    await course.populate([
      { path: 'classId', select: 'name academicYear' },
      { path: 'mentorId', select: 'name email' },
      { path: 'studentIds', select: 'name email' },
    ]);

    return res.json({ message: 'Course updated', course });
  } catch (error) {
    console.error('Update course error:', error);
    if (error instanceof Error && error.message.includes('validation failed')) {
      return res.status(400).json({ error: 'Invalid course data provided' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCourse(req: Request, res: Response) {
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
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const userRef = user as unknown as UserReference;
    const courseRef = course as unknown as CourseReference;

    if (!(await ensureAuthorised(userRef, courseRef))) {
      return res.status(403).json({ error: 'You are not authorised to archive this course' });
    }

    course.isActive = false;
    await course.save();

    return res.json({ message: 'Course archived' });
  } catch (error) {
    console.error('Delete course error:', error);
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const course = await Course.findById(id)
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name email')
      .populate('studentIds', 'name email');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.json({ course });
  } catch (error) {
    console.error('Get course by id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
