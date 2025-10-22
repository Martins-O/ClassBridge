import {NextRequest, NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import User from '@/models/User';
import {getUserIdFromRequest} from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
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

    const { id } = await params;
      const classDoc = await Class.findById(id).populate('studentIds', 'name email studentId isActive');
    if (!classDoc) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    let hasAccess: boolean;

    switch (currentUser.role) {
      case 'super_admin':
        hasAccess = true;
        break;
      case 'school_admin':
        hasAccess = classDoc.schoolId?.toString() === currentUser.schoolId?.toString();
        break;
      case 'mentor':
        hasAccess = classDoc.mentorIds.some(
          (mentorId: { toString(): string }) => mentorId.toString() === userId
        );
        break;
      case 'student':
        hasAccess = classDoc.studentIds.some(
          (student: { _id: { toString(): string } }) => student._id.toString() === userId
        );
        break;
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const students = classDoc.studentIds.map((student: { _id: string; name: string; email: string; studentId?: string; isActive?: boolean }) => ({
      id: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      isActive: student.isActive,
    }));

    return NextResponse.json({ students });
  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
