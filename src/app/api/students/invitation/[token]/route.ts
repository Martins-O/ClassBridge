import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentInvitation from '@/models/StudentInvitation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();

    const { token } = await params;

    // Find the invitation
    const invitation = await StudentInvitation.findOne({
      token: token
    }).populate(['schoolId', 'classId', 'invitedBy']);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // Mark as expired if not already
      if (invitation.status === 'pending') {
        invitation.status = 'expired';
        await invitation.save();
      }

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 410 }
      );
    }

    // Return invitation details
    const inviter = invitation.invitedBy as { name: string; role: string };
    const school = invitation.schoolId as { name: string; _id: string };
    const classData = invitation.classId as { name: string; _id: string; subject?: string; grade?: string };

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        name: invitation.name,
        school: {
          name: school.name,
          id: school._id
        },
        class: {
          name: classData.name,
          id: classData._id,
          subject: classData.subject,
          grade: classData.grade
        },
        inviter: {
          name: inviter.name,
          role: inviter.role
        },
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}