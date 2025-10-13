import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = request.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id: classId } = await params;

    // Find the class
    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check permissions - only mentors/admins from the same school or students in the class can view
    let hasAccess = false;
    if (currentUser.role === 'super_admin') {
      hasAccess = true;
    } else if (currentUser.role === 'school_admin') {
      hasAccess = classData.schoolId.toString() === currentUser.schoolId?.toString();
    } else if (currentUser.role === 'mentor') {
      hasAccess = classData.mentorIds.some(
        (mentorId: string) => mentorId.toString() === userId
      );
    } else if (currentUser.role === 'student') {
      hasAccess = classData.studentIds.some(
        (studentId: string) => studentId.toString() === userId
      );
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch students in this class
    const students = await User.find({
      _id: { $in: classData.studentIds },
      role: 'student'
    }).select('_id name email studentId isActive createdAt').sort({ name: 1 });

    return NextResponse.json({
      students,
      classInfo: {
        _id: classData._id,
        name: classData.name,
        studentCount: students.length
      }
    });

  } catch (error) {
    console.error('Error fetching class students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}