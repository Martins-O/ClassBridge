import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';

// GET /api/classes/[id] - Get a specific class
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const classData = await Class.findById(params.id)
      .populate('teacherIds', 'name email')
      .populate('studentIds', 'name email')
      .populate('schoolId', 'name');

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ class: classData });

  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/classes/[id] - Update class
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      description,
      teacherIds,
      studentIds,
      subject,
      grade,
      semester,
      maxStudents,
      isActive
    } = body;

    const classData = await Class.findById(params.id);
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (name !== undefined) classData.name = name;
    if (description !== undefined) classData.description = description;
    if (teacherIds !== undefined) classData.teacherIds = teacherIds;
    if (studentIds !== undefined) classData.studentIds = studentIds;
    if (subject !== undefined) classData.subject = subject;
    if (grade !== undefined) classData.grade = grade;
    if (semester !== undefined) classData.semester = semester;
    if (maxStudents !== undefined) classData.maxStudents = maxStudents;
    if (isActive !== undefined) classData.isActive = isActive;

    await classData.save();
    await classData.populate(['teacherIds', 'studentIds']);

    return NextResponse.json({
      message: 'Class updated successfully',
      class: classData
    });

  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id] - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const classData = await Class.findByIdAndDelete(params.id);
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Class deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
