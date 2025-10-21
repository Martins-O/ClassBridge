import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Grade from '@/models/Grade';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/grades/[id] - Fetch a specific grade
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

    const { id: gradeId } = await params;

    const grade = await Grade.findById(gradeId)
      .populate('studentId', 'name email studentId')
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name');

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    // Permission check
    let hasAccess = false;

    if (currentUser.role === 'student') {
      hasAccess = grade.studentId._id.toString() === userId;
    } else if (currentUser.role === 'mentor') {
      hasAccess = grade.mentorId._id.toString() === userId;
    } else if (currentUser.role === 'school_admin') {
      hasAccess = grade.schoolId.toString() === currentUser.schoolId?.toString();
    } else if (currentUser.role === 'super_admin') {
      hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ grade });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/grades/[id] - Update a grade
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

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only mentors, school admins, and super admins can update grades
    if (!['mentor', 'school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: gradeId } = await params;
    const updateData = await request.json();

    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    // Permission check for updates
    if (currentUser.role === 'mentor') {
      if (grade.mentorId.toString() !== userId) {
        return NextResponse.json(
          { error: 'You can only update grades you created' },
          { status: 403 }
        );
      }
    } else if (currentUser.role === 'school_admin') {
      if (grade.schoolId.toString() !== currentUser.schoolId?.toString()) {
        return NextResponse.json(
          { error: 'You can only update grades from your school' },
          { status: 403 }
        );
      }
    }

    // Update grade fields
    const allowedUpdates = ['title', 'description', 'points', 'maxPoints', 'weight', 'comments', 'rubric', 'dueDate', 'status'];
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        grade[key] = updateData[key];
      }
    });

    await grade.save();

    return NextResponse.json({
      message: 'Grade updated successfully',
      grade
    });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/grades/[id] - Delete a grade
export async function DELETE(
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

    // Only mentors, school admins, and super admins can delete grades
    if (!['mentor', 'school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: gradeId } = await params;

    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    // Permission check
    if (currentUser.role === 'mentor') {
      if (grade.mentorId.toString() !== userId) {
        return NextResponse.json(
          { error: 'You can only delete grades you created' },
          { status: 403 }
        );
      }
    } else if (currentUser.role === 'school_admin') {
      if (grade.schoolId.toString() !== currentUser.schoolId?.toString()) {
        return NextResponse.json(
          { error: 'You can only delete grades from your school' },
          { status: 403 }
        );
      }
    }

    await Grade.findByIdAndDelete(gradeId);

    return NextResponse.json({
      message: 'Grade deleted successfully'
    });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
