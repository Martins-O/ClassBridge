import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import School from '@/models/School';
import User from '@/models/User';

// POST /api/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      description,
      schoolId,
      teacherIds = [],
      studentIds = [],
      subject,
      grade,
      academicYear,
      semester,
      maxStudents
    } = body;

    // Validate required fields
    if (!name || !schoolId || !academicYear) {
      return NextResponse.json(
        { error: 'Name, school ID, and academic year are required' },
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

    // Create new class
    const newClass = new Class({
      name,
      description,
      schoolId,
      teacherIds,
      studentIds,
      subject,
      grade,
      academicYear,
      semester,
      maxStudents
    });

    await newClass.save();

    // Populate references for response
    await newClass.populate(['teacherIds', 'studentIds']);

    return NextResponse.json({
      message: 'Class created successfully',
      class: newClass
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
