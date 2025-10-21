import { NextRequest, NextResponse } from 'next/server';
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
  validateNumber
} from '@/lib/validation';

// POST /api/courses - Create a new course (Mentors only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication and user role
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only mentors and super admins can create courses
    if (!['mentor', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only mentors can create courses' },
        { status: 403 }
      );
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
      maxStudents = 30,
      syllabus
    } = body;

    // Comprehensive validation
    const validation = new ValidationResult();
    validation.errors.push(...validateString(name, 'name', { required: true, minLength: 3, maxLength: 100 }));
    validation.errors.push(...validateObjectId(classId, 'classId'));
    validation.errors.push(...validateEnum(duration, 'duration', ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months']));

    if (maxStudents) {
      validation.errors.push(...validateNumber(maxStudents, 'maxStudents', { min: 1, max: 100, integer: true }));
    }

    if (!validation.isValid()) {
      return validation.getResponse();
    }

    // Verify class exists and mentor has access to it
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if mentor is assigned to this class
    if (user.role === 'mentor' && !classExists.mentorIds.includes(userId)) {
      return NextResponse.json(
        { error: 'You can only create courses for classes you are assigned to' },
        { status: 403 }
      );
    }

    // Create new course
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
      syllabus
    });

    await newCourse.save();

    // Populate references for response
    await newCourse.populate(['classId', 'mentorId']);

    return NextResponse.json({
      message: 'Course created successfully',
      course: newCourse
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Invalid course data provided' },
          { status: 400 }
        );
      }
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'A course with this name already exists in this class' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/courses - Fetch courses
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let courses;

    // Filter courses based on user role
    if (user.role === 'super_admin') {
      // Super admin can see all courses
      courses = await Course.find()
        .populate('classId', 'name academicYear')
        .populate('mentorId', 'name email')
        .populate('studentIds', 'name email')
        .lean();
    } else if (user.role === 'school_admin') {
      // School admin can see courses from their school's classes
      const schoolClasses = await Class.find({ schoolId: user.schoolId });
      const classIds = schoolClasses.map(cls => cls._id);

      courses = await Course.find({ classId: { $in: classIds } })
        .populate('classId', 'name academicYear')
        .populate('mentorId', 'name email')
        .populate('studentIds', 'name email')
        .lean();
    } else if (user.role === 'mentor') {
      // Mentors can see courses they created or are assigned to
      courses = await Course.find({ mentorId: userId })
        .populate('classId', 'name academicYear')
        .populate('mentorId', 'name email')
        .populate('studentIds', 'name email')
        .lean();
    } else if (user.role === 'student') {
      // Students can see courses they're enrolled in
      courses = await Course.find({ studentIds: userId })
        .populate('classId', 'name academicYear')
        .populate('mentorId', 'name email')
        .populate('studentIds', 'name email')
        .lean();
    } else {
      courses = [];
    }

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}