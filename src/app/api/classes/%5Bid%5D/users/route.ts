import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import User from '@/models/User';

// POST /api/classes/[id]/users - Add users to class
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { userIds, userType } = body; // userType: 'teacher' or 'student'

    if (!userIds || !Array.isArray(userIds) || !userType) {
      return NextResponse.json(
        { error: 'User IDs array and user type are required' },
        { status: 400 }
      );
    }

    const classData = await Class.findById(params.id);
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Validate users exist and have correct role
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: 'One or more users not found' },
        { status: 404 }
      );
    }

    // Check if users have appropriate roles
    const invalidUsers = users.filter(user =>
      (userType === 'teacher' && user.role !== 'mentor') ||
      (userType === 'student' && user.role !== 'student')
    );

    if (invalidUsers.length > 0) {
      return NextResponse.json(
        { error: `Some users do not have the ${userType} role` },
        { status: 400 }
      );
    }

    // Add users to appropriate array
    if (userType === 'teacher') {
      classData.teacherIds = [...new Set([...classData.teacherIds, ...userIds])];
    } else if (userType === 'student') {
      classData.studentIds = [...new Set([...classData.studentIds, ...userIds])];
    }

    await classData.save();
    await classData.populate([userType === 'teacher' ? 'teacherIds' : 'studentIds']);

    return NextResponse.json({
      message: `${userType === 'teacher' ? 'Teachers' : 'Students'} added successfully`,
      class: classData
    });

  } catch (error) {
    console.error('Error adding users to class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id]/users - Remove users from class
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { userIds, userType } = body;

    if (!userIds || !Array.isArray(userIds) || !userType) {
      return NextResponse.json(
        { error: 'User IDs array and user type are required' },
        { status: 400 }
      );
    }

    const classData = await Class.findById(params.id);
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Remove users from appropriate array
    if (userType === 'teacher') {
      classData.teacherIds = classData.teacherIds.filter(
        (id: any) => !userIds.some((userId: string) => userId === id.toString())
      );
    } else if (userType === 'student') {
      classData.studentIds = classData.studentIds.filter(
        (id: any) => !userIds.some((userId: string) => userId === id.toString())
      );
    }

    await classData.save();

    return NextResponse.json({
      message: `${userType === 'teacher' ? 'Teachers' : 'Students'} removed successfully`
    });

  } catch (error) {
    console.error('Error removing users from class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
