import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/session';
import School from '@/models/School';
import User from '@/models/User';

// GET /api/schools/get - Get schools for current user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userId).select('role schoolId');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'super_admin') {
      const schools = await School.find({}).populate('adminId', 'name email');
      return NextResponse.json({ schools });
    }

    if (user.role === 'school_admin') {
      const schools = await School.find({ adminId: userId }).populate('adminId', 'name email');
      return NextResponse.json({ schools });
    }

    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
