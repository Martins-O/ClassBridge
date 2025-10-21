import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import School from '@/models/School';
import Class from '@/models/Class';
import MentorInvitation from '@/models/MentorInvitation';
import { sendEmail, generateMentorInvitationEmail } from '@/lib/email';
import crypto from 'crypto';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/mentors - Fetch mentors for a school
export async function GET(request: NextRequest) {
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

    // Only school admins and super admins can view mentors
    if (!['school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only school administrators can view mentors' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || currentUser.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Verify school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // For school admins, ensure they can only view mentors from their own school
    if (currentUser.role === 'school_admin' && currentUser.schoolId?.toString() !== schoolId) {
      return NextResponse.json(
        { error: 'You can only view mentors from your own school' },
        { status: 403 }
      );
    }

    // Fetch mentors for the school
    const mentors = await User.find({
      role: 'mentor',
      schoolId: schoolId,
      isActive: true
    }).select('-password');

    // Get class assignments for each mentor
    const mentorsWithClasses = await Promise.all(
      mentors.map(async (mentor) => {
        const classes = await Class.find({
          mentorIds: mentor._id
        }).select('name _id');

        return {
          ...mentor.toObject(),
          assignedClasses: classes
        };
      })
    );

    return NextResponse.json({ mentors: mentorsWithClasses });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/mentors - Create a new mentor (invite mentor to school)
export async function POST(request: NextRequest) {
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

    // Only school admins and super admins can invite mentors
    if (!['school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only school administrators can invite mentors' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      schoolId
    } = body;

    // Validate required fields
    if (!name || !email || !schoolId) {
      return NextResponse.json(
        { error: 'Name, email, and school ID are required' },
        { status: 400 }
      );
    }

    // Verify school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // For school admins, ensure they can only invite mentors to their own school
    if (currentUser.role === 'school_admin' && currentUser.schoolId?.toString() !== schoolId) {
      return NextResponse.json(
        { error: 'You can only invite mentors to your own school' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // If user exists but is not a mentor at this school, update their role and school
      if (existingUser.role !== 'mentor' || existingUser.schoolId?.toString() !== schoolId) {
        existingUser.role = 'mentor';
        existingUser.schoolId = schoolId;
        existingUser.isActive = true;
        await existingUser.save();
      }
      return NextResponse.json({
        message: 'Mentor added successfully',
        mentor: existingUser,
        isExistingUser: true
      }, { status: 200 });
    }

    // Check if there's already a pending invitation for this email and school
    const existingInvitation = await MentorInvitation.findOne({
      email: email.toLowerCase(),
      schoolId: schoolId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An active invitation already exists for this mentor in this school' },
        { status: 400 }
      );
    }

    // Generate unique invitation token
    const token = crypto.randomUUID();

    // Create invitation with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new MentorInvitation({
      email: email.toLowerCase(),
      name,
      schoolId,
      invitedBy: userId,
      token: token,
      expiresAt: expiresAt
    });

    await invitation.save();

    // Prepare email data
    const emailData = generateMentorInvitationEmail({
      mentorEmail: email.toLowerCase(),
      mentorName: name,
      schoolName: school.name,
      invitationToken: token,
      inviterName: currentUser.name
    });

    // Send invitation email
    const emailSent = await sendEmail(emailData);

    if (!emailSent) {
      // If email fails, delete the invitation
      await MentorInvitation.findByIdAndDelete(invitation._id);
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Mentor invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: email.toLowerCase(),
        name,
        expiresAt: expiresAt
      },
      isExistingUser: false
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/mentors - Update mentor class assignments (bulk operation)
export async function PUT(request: NextRequest) {
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

    // Only school admins and super admins can manage mentor assignments
    if (!['school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only school administrators can manage mentor assignments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      mentorId,
      classIds, // Array of class IDs to assign/remove
      action // 'assign' or 'remove'
    } = body;

    if (!mentorId || !classIds || !action) {
      return NextResponse.json(
        { error: 'Mentor ID, class IDs, and action are required' },
        { status: 400 }
      );
    }

    // Verify mentor exists and belongs to the same school
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    if (currentUser.role === 'school_admin' &&
        mentor.schoolId?.toString() !== currentUser.schoolId?.toString()) {
      return NextResponse.json(
        { error: 'You can only manage mentors from your own school' },
        { status: 403 }
      );
    }

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

    // Return updated mentor with class assignments
    const updatedMentor = await User.findById(mentorId).select('-password');
    const assignedClasses = await Class.find({
      mentorIds: mentorId
    }).select('name _id');

    return NextResponse.json({
      message: `Mentor ${action}ed to classes successfully`,
      mentor: {
        ...updatedMentor.toObject(),
        assignedClasses
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
