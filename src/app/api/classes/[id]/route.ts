import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const classId = id;
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
        (mentorId: { _id?: string }) => mentorId._id?.toString() === userId
      );
    } else if (user.role === 'student') {
      hasAccess = classData.studentIds.some(
        (studentId: { _id?: string }) => studentId._id?.toString() === userId
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
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const classId = id;

    // Find the class first to check permissions
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update this class
    let hasAccess = false;

    if (user.role === 'super_admin') {
      hasAccess = true;
    } else if (user.role === 'school_admin') {
      hasAccess = existingClass.schoolId.toString() === user.schoolId?.toString();
    } else {
      return NextResponse.json(
        { error: 'Only administrators can update classes' },
        { status: 403 }
      );
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isActive, ...otherUpdates } = body;

    // Prepare update object
    const updates: Record<string, unknown> = { ...otherUpdates };

    // Handle status changes (deactivation/activation)
    if (typeof isActive === 'boolean') {
      updates.isActive = isActive;
    }

    // Update the class
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate(['mentorIds', 'studentIds', 'schoolId']);

    if (!updatedClass) {
      return NextResponse.json(
        { error: 'Failed to update class' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Class updated successfully',
      class: updatedClass
    });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
