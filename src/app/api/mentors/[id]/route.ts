import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Class from '@/models/Class';
import { getUserIdFromRequest } from '@/lib/session';

// PUT /api/mentors/[id] - Update mentor information or assign/remove from classes
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

    // Only school admins and super admins can update mentors
    if (!['school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only school administrators can update mentors' },
        { status: 403 }
      );
    }

    const { id: mentorId } = await params;
    const body = await request.json();
    const {
      name,
      email,
      classIds, // Array of class IDs to assign the mentor to
      action // 'assign' or 'remove' for class assignment
    } = body;

    // Find the mentor
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Verify mentor belongs to the same school as the current user
    if (currentUser.role === 'school_admin' &&
        mentor.schoolId?.toString() !== currentUser.schoolId?.toString()) {
      return NextResponse.json(
        { error: 'You can only manage mentors from your own school' },
        { status: 403 }
      );
    }

    if (name || email) {
      // Update mentor information
      if (name) mentor.name = name;
      if (email) mentor.email = email.toLowerCase();
      await mentor.save();
    }

    if (classIds && action) {
      if (action === 'assign') {
        // Assign mentor to classes
        for (const classId of classIds) {
          const classDoc = await Class.findById(classId);
          if (classDoc && !classDoc.mentorIds.includes(mentorId)) {
            classDoc.mentorIds.push(mentorId);
            await classDoc.save();
          }
        }
      } else if (action === 'remove') {
        // Remove mentor from classes
        for (const classId of classIds) {
          const classDoc = await Class.findById(classId);
          if (classDoc) {
            classDoc.mentorIds = classDoc.mentorIds.filter(
              (id: string) => id.toString() !== mentorId
            );
            await classDoc.save();
          }
        }
      }
    }

    // Get updated mentor with class assignments
    const updatedMentor = await User.findById(mentorId).select('-password');
    const assignedClasses = await Class.find({
      mentorIds: mentorId
    }).select('name _id');

    return NextResponse.json({
      message: 'Mentor updated successfully',
      mentor: {
        ...updatedMentor.toObject(),
        assignedClasses
      }
    });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/mentors/[id] - Deactivate mentor
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

    // Only school admins and super admins can deactivate mentors
    if (!['school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only school administrators can deactivate mentors' },
        { status: 403 }
      );
    }

    const { id: mentorId } = await params;

    // Find the mentor
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Verify mentor belongs to the same school as the current user
    if (currentUser.role === 'school_admin' &&
        mentor.schoolId?.toString() !== currentUser.schoolId?.toString()) {
      return NextResponse.json(
        { error: 'You can only manage mentors from your own school' },
        { status: 403 }
      );
    }

    // Deactivate the mentor instead of deleting
    mentor.isActive = false;
    await mentor.save();

    // Remove mentor from all classes
    await Class.updateMany(
      { mentorIds: mentorId },
      { $pull: { mentorIds: mentorId } }
    );

    return NextResponse.json({
      message: 'Mentor deactivated successfully'
    });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
