import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentInvitation from '@/models/StudentInvitation';
import User from '@/models/User';
import Class from '@/models/Class';
import bcrypt from 'bcrypt';

// Function to generate unique student ID
async function generateStudentId(schoolId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const schoolIdLast4 = schoolId.slice(-4).toUpperCase();

  // Find the highest student number for this school and year
  const lastStudent = await User.findOne({
    schoolId: schoolId,
    role: 'student',
    studentId: { $regex: `^${currentYear}${schoolIdLast4}` }
  }).sort({ studentId: -1 });

  let nextNumber = 1;
  if (lastStudent?.studentId) {
    const lastNumber = parseInt(lastStudent.studentId.slice(-4));
    nextNumber = lastNumber + 1;
  }

  return `${currentYear}${schoolIdLast4}${nextNumber.toString().padStart(4, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { token, password } = await request.json();

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: token, password' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await StudentInvitation.findOne({
      token: token,
      status: 'pending'
    }).populate(['schoolId', 'classId']);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      invitation.status = 'expired';
      await invitation.save();

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique student ID
    const studentId = await generateStudentId(invitation.schoolId._id.toString());

    // Create new student user
    const newUser = new User({
      name: invitation.name,
      email: invitation.email,
      password: hashedPassword,
      role: 'student',
      schoolId: invitation.schoolId._id,
      studentId: studentId,
      isActive: true
    });

    await newUser.save();

    // Add student to the class
    await Class.findByIdAndUpdate(
      invitation.classId._id,
      { $addToSet: { studentIds: newUser._id } }
    );

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    return NextResponse.json({
      message: 'Invitation accepted successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        schoolId: newUser.schoolId
      }
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}