import { NextRequest, NextResponse } from 'next/server';
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

// POST /api/classes - Create a new class
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
      );
    }


    // Only school admins and super admins can create classes
    if (!['school_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only school administrators can create classes' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      schoolId,
      mentorIds = [],
      studentIds = [],
      subject,
      grade,
      academicYear,
      semester,
      maxStudents,
      duration,
      cohort
    } = body;

    // Validate required fields
    if (!name || !schoolId || !academicYear || !duration || !cohort) {
      return NextResponse.json(
        { error: 'Name, school ID, academic year, duration, and cohort are required' },
        { status: 400 }
      );
    }

    // Verify school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }


    // For school admins, ensure they can only create classes for their own school
    if (user.role === 'school_admin' && user.schoolId?.toString() !== schoolId) {
      return NextResponse.json(
        { error: 'You can only create classes for your own school' },
        { status: 403 }
      );
    }

    // Create new class
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
      cohort
    });

    await newClass.save();

    // Populate references for response
    await newClass.populate(['mentorIds', 'studentIds']);

    return NextResponse.json({
      message: 'Class created successfully',
      class: newClass
    }, { status: 201 });

  } catch (error) {

    // Return more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Invalid class data provided' },
          { status: 400 }
        );
      }
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'A class with this name already exists' },
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

// GET /api/classes - Fetch classes
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

    let classes: unknown[];

    // Filter classes based on user role
    if (user.role === 'super_admin') {
      // Super admin can see all classes
      classes = await Class.find()
        .populate('mentorIds', 'name email')
        .populate('studentIds', 'name email studentId isActive')
        .lean();
    } else if (user.role === 'school_admin') {
      // School admin can see classes from their school
      classes = await Class.find({ schoolId: user.schoolId })
        .populate('mentorIds', 'name email')
        .populate('studentIds', 'name email studentId isActive')
        .lean();
    } else if (user.role === 'mentor') {
      // Mentors can see classes they're assigned to
      classes = await Class.find({ mentorIds: userId })
        .populate('mentorIds', 'name email')
        .populate('studentIds', 'name email studentId isActive')
        .lean();
    } else if (user.role === 'student') {
      // Students can see classes they're enrolled in
      classes = await Class.find({ studentIds: userId })
        .populate('mentorIds', 'name email')
        .populate('studentIds', 'name email studentId isActive')
        .lean();
    } else {
      classes = [];
    }

    const formattedClasses = classes.map((classDoc) => formatClassDocument(classDoc as PopulatedClassDoc));

    return NextResponse.json({ classes: formattedClasses });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
