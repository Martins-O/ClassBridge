import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MentorInvitation from '@/models/MentorInvitation';
import User from '@/models/User';
import School from '@/models/School';
import bcrypt from 'bcrypt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();

    const { token } = await params;

    // Find the invitation by token
    const invitation = await MentorInvitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('schoolId', 'name');

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Get inviter information
    const inviter = await User.findById(invitation.invitedBy).select('name');

    return NextResponse.json({
      invitation: {
        _id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        schoolName: invitation.schoolId.name,
        inviterName: inviter?.name || 'School Administrator',
        expiresAt: invitation.expiresAt,
        status: invitation.status
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();

    const { token } = await params;
    const { password } = await request.json();

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find the invitation by token
    const invitation = await MentorInvitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if user already exists (shouldn't happen if invitation was created properly)
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new mentor user
    const newMentor = new User({
      name: invitation.name,
      email: invitation.email,
      password: hashedPassword,
      role: 'mentor',
      schoolId: invitation.schoolId,
      isActive: true
    });

    await newMentor.save();

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Get school information for response
    const school = await School.findById(invitation.schoolId).select('name');

    return NextResponse.json({
      message: 'Mentor account created successfully',
      mentor: {
        _id: newMentor._id,
        name: newMentor.name,
        email: newMentor.email,
        role: newMentor.role,
        schoolName: school?.name
      }
    }, { status: 201 });

  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}