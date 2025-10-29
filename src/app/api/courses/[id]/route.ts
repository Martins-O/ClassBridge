import { NextRequest, NextResponse } from 'next/server';
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

const isObjectIdEqual = (a: MaybeObjectId, b: MaybeObjectId) => {
  if (!a || !b) return false;
  const left = typeof a === 'string' ? a : (a as Types.ObjectId).toString();
  const right = typeof b === 'string' ? b : (b as Types.ObjectId).toString();
  return left === right;
};

const isCourseOwner = (userId: string, course: CourseReference) => {
  if (!course?.mentorId) return false;
  return isObjectIdEqual(course.mentorId, userId);
};

async function ensureAuthorised(user: UserReference | null, course: CourseReference) {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'mentor' && user._id && isCourseOwner(user._id.toString(), course)) return true;

  if (user.role === 'school_admin') {
    const rawClassId = course?.classId;
    const classId = typeof rawClassId === 'object' && rawClassId ? rawClassId._id : rawClassId;
    if (!classId) return false;
    const courseClass = await Class.findById(classId).lean() as { schoolId: MaybeObjectId } | null;
    if (!courseClass) return false;
    return isObjectIdEqual(courseClass.schoolId, user.schoolId);
  }

  return false;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await context.params;
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const userRef = user as unknown as UserReference;
    const courseRef = course as unknown as CourseReference;

    if (!(await ensureAuthorised(userRef, courseRef))) {
      return NextResponse.json({ error: 'You are not authorised to update this course' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      classId,
      subject,
      duration,
      startDate,
      endDate,
      maxStudents,
      syllabus,
      isActive,
    } = body;

    const validation = new ValidationResult();

    if (typeof name !== 'undefined') {
      validation.errors.push(
        ...validateString(name, 'name', { required: true, minLength: 3, maxLength: 100 })
      );
    }
    if (typeof description !== 'undefined') {
      validation.errors.push(
        ...validateString(description, 'description', { required: false, maxLength: 500 })
      );
    }
    if (typeof subject !== 'undefined') {
      validation.errors.push(
        ...validateString(subject, 'subject', { required: false, maxLength: 50 })
      );
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
      validation.errors.push(
        ...validateNumber(maxStudents, 'maxStudents', { min: 1, max: 100, integer: true })
      );
    }

    if (!validation.isValid()) {
      return validation.getResponse();
    }

    if (classId && !isObjectIdEqual(course.classId as MaybeObjectId, classId)) {
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }
      if (userRef.role === 'mentor' && !classDoc.mentorIds.includes(user._id)) {
        return NextResponse.json({ error: 'You can only assign courses to your own classes' }, { status: 403 });
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

    return NextResponse.json({ message: 'Course updated', course });
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation failed')) {
      return NextResponse.json({ error: 'Invalid course data provided' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await context.params;
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const userRef = user as unknown as UserReference;
    const courseRef = course as unknown as CourseReference;

    if (!(await ensureAuthorised(userRef, courseRef))) {
      return NextResponse.json({ error: 'You are not authorised to archive this course' }, { status: 403 });
    }

    course.isActive = false;
    await course.save();

    return NextResponse.json({ message: 'Course archived' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
