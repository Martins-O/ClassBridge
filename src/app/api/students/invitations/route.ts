import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentInvitation from '@/models/StudentInvitation';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

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

    // Check permissions - only school admins can view invitations
    if (!['school_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only school administrators can view invitations' },
        { status: 403 }
      );
    }

    // Build query based on user role
    let query = {};
    if (user.role === 'school_admin') {
      query = { schoolId: user.schoolId };
    }

    // Fetch invitations
    const invitations = await StudentInvitation.find(query)
      .populate('classId', 'name academicYear semester')
      .populate('schoolId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      invitations: invitations.map(invitation => ({
        _id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        classId: {
          _id: invitation.classId._id,
          name: invitation.classId.name,
          academicYear: invitation.classId.academicYear,
          semester: invitation.classId.semester
        },
        schoolId: invitation.schoolId._id,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      }))
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}