import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transcript from '@/models/Transcript';
import User from '@/models/User';
import Class from '@/models/Class';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/transcripts/[id] - Fetch a specific transcript
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

    const { id: transcriptId } = await params;

    const transcript = await Transcript.findById(transcriptId)
      .populate('studentId', 'name email studentId')
      .populate('schoolId', 'name address')
      .populate('courseRecords.classId', 'name')
      .populate('courseRecords.mentorId', 'name');

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Permission check
    let hasAccess = false;

    if (currentUser.role === 'student') {
      hasAccess = transcript.studentId._id.toString() === userId;
    } else if (currentUser.role === 'mentor') {
      // Check if mentor has taught any of the courses in the transcript
      const mentorClasses = await Class.find({ mentorIds: userId }).select('_id');
      const mentorClassIds = mentorClasses.map(cls => cls._id.toString());
      hasAccess = transcript.courseRecords.some((record: { classId: { _id: { toString(): string } } }) =>
        mentorClassIds.includes(record.classId._id.toString())
      );
    } else if (currentUser.role === 'school_admin') {
      hasAccess = transcript.schoolId._id.toString() === currentUser.schoolId?.toString();
    } else if (currentUser.role === 'super_admin') {
      hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ transcript });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/transcripts/[id] - Update a transcript
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

    // Only mentors, school admins, and super admins can update transcripts
    if (!['mentor', 'school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: transcriptId } = await params;
    const updateData = await request.json();

    const transcript = await Transcript.findById(transcriptId);
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Permission check for updates
    if (currentUser.role === 'school_admin') {
      if (transcript.schoolId.toString() !== currentUser.schoolId?.toString()) {
        return NextResponse.json(
          { error: 'You can only update transcripts from your school' },
          { status: 403 }
        );
      }
    }

    // Update transcript fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'createdAt') {
        transcript[key] = updateData[key];
      }
    });

    await transcript.save();

    return NextResponse.json({
      message: 'Transcript updated successfully',
      transcript
    });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/transcripts/[id] - Delete a transcript
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

    // Only school admins and super admins can delete transcripts
    if (!['school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only administrators can delete transcripts' },
        { status: 403 }
      );
    }

    const { id: transcriptId } = await params;

    const transcript = await Transcript.findById(transcriptId);
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Permission check
    if (currentUser.role === 'school_admin') {
      if (transcript.schoolId.toString() !== currentUser.schoolId?.toString()) {
        return NextResponse.json(
          { error: 'You can only delete transcripts from your school' },
          { status: 403 }
        );
      }
    }

    await Transcript.findByIdAndDelete(transcriptId);

    return NextResponse.json({
      message: 'Transcript deleted successfully'
    });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
