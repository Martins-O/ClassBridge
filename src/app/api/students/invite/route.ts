import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentInvitation from '@/models/StudentInvitation';
import User from '@/models/User';
import Class from '@/models/Class';
import { sendEmail, generateStudentInvitationEmail } from '@/lib/email';
import crypto from 'crypto';
import { getUserIdFromRequest } from '@/lib/session';

export async function POST(request: NextRequest) {
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

    // Check permissions - only school admins can invite students
    if (!['school_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only school administrators can invite students' },
        { status: 403 }
      );
    }

    const { studentEmail, studentName, classId } = await request.json();

    // Validate required fields
    if (!studentEmail || !studentName || !classId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentEmail, studentName, classId' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get class and school information
    const classData = await Class.findById(classId).populate('schoolId');
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if school admin has access to this class
    if (user.role === 'school_admin') {
      const hasAccess = classData.schoolId._id.toString() === user.schoolId?.toString();
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to this class' },
          { status: 403 }
        );
      }
    }

    // Check if student is already registered
    const existingUser = await User.findOne({ email: studentEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email and class
    const existingInvitation = await StudentInvitation.findOne({
      email: studentEmail,
      classId: classId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An active invitation already exists for this student in this class' },
        { status: 400 }
      );
    }

    // Generate unique invitation token
    const token = crypto.randomUUID();

    // Create invitation with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new StudentInvitation({
      email: studentEmail,
      name: studentName,
      schoolId: classData.schoolId._id,
      classId: classId,
      invitedBy: userId,
      token: token,
      expiresAt: expiresAt
    });

    await invitation.save();

    // Prepare email data
    const school = classData.schoolId as { name: string };
    const emailData = generateStudentInvitationEmail({
      studentEmail,
      studentName,
      schoolName: school.name,
      className: classData.name,
      invitationToken: token,
      inviterName: user.name
    });

    // Send invitation email
    const emailSent = await sendEmail(emailData);

    if (!emailSent) {
      // If email fails, delete the invitation
      await StudentInvitation.findByIdAndDelete(invitation._id);
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: studentEmail,
        name: studentName,
        className: classData.name,
        expiresAt: expiresAt
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
