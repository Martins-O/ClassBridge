import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';

// GET /api/schools - Get schools for current user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user from cookie/session (using existing auth system)
    const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = await response.json();

    let schools;

    if (user.role === 'super_admin') {
      // Super admin can see all schools
      schools = await School.find({}).populate('adminId', 'name email');
    } else if (user.role === 'school_admin') {
      // School admin can only see their own schools
      schools = await School.find({ adminId: user.id }).populate('adminId', 'name email');
    } else {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ schools });

  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
