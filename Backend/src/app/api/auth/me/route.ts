import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';
import { serializeUser } from '@/lib/serializeUser';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('schoolId', 'name email phone address website description subscriptionType')
      .populate('classIds', 'name academicYear cohort duration isActive');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: serializeUser(user),
    });
  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
