import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const classId = params.id;
    const classData = await Class.findById(classId).populate([
      'mentorIds',
      'studentIds',
      'schoolId'
    ]);

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this class
    let hasAccess = false;

    if (user.role === 'super_admin') {
      hasAccess = true;
    } else if (user.role === 'school_admin') {
      hasAccess = classData.schoolId?._id?.toString() === user.schoolId?.toString();
    } else if (user.role === 'mentor') {
      hasAccess = classData.mentorIds.some(
        (mentorId: any) => mentorId._id?.toString() === userId
      );
    } else if (user.role === 'student') {
      hasAccess = classData.studentIds.some(
        (studentId: any) => studentId._id?.toString() === userId
      );
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ class: classData });
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}