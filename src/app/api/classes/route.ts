import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import School from '@/models/School';
import User from '@/models/User';

// POST /api/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication and user role
    const userId = request.cookies.get('userId')?.value;
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
      maxStudents
    });

    await newClass.save();

    // Populate references for response
    await newClass.populate(['mentorIds', 'studentIds']);

    return NextResponse.json({
      message: 'Class created successfully',
      class: newClass
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating class:', error);
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
    const userId = request.cookies.get('userId')?.value;
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

    let classes;

    // Filter classes based on user role
    if (user.role === 'super_admin') {
      // Super admin can see all classes
      classes = await Class.find().populate(['mentorIds', 'studentIds']);
    } else if (user.role === 'school_admin') {
      // School admin can see classes from their school
      classes = await Class.find({ schoolId: user.schoolId }).populate(['mentorIds', 'studentIds']);
    } else if (user.role === 'mentor') {
      // Mentors can see classes they're assigned to
      classes = await Class.find({ mentorIds: userId }).populate(['mentorIds', 'studentIds']);
    } else if (user.role === 'student') {
      // Students can see classes they're enrolled in
      classes = await Class.find({ studentIds: userId }).populate(['mentorIds', 'studentIds']);
    } else {
      classes = [];
    }

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
