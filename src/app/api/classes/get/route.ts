import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import School from '@/models/School';

// GET /api/classes?schoolId=xxx - Get classes for a school
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

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

    const classes = await Class.find({ schoolId })
      .populate('teacherIds', 'name email')
      .populate('studentIds', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ classes });

  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
