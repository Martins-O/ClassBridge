import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Class from '@/models/Class';
import School from '@/models/School';

type PopulatedReference = {
  _id: { toString(): string };
  name?: string;
  email?: string;
  studentId?: string;
  isActive?: boolean;
};

type PopulatedClassDoc = {
  _id: { toString(): string };
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  academicYear: string;
  semester?: string;
  cohort?: string;
  duration?: string;
  schoolId?: { toString(): string };
  mentorIds?: PopulatedReference[];
  studentIds?: PopulatedReference[];
  isActive?: boolean;
  maxStudents?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

function formatClassDocument(classDoc: PopulatedClassDoc) {
  return {
    id: classDoc._id.toString(),
    name: classDoc.name,
    description: classDoc.description,
    subject: classDoc.subject,
    grade: classDoc.grade,
    academicYear: classDoc.academicYear,
    semester: classDoc.semester,
    cohort: classDoc.cohort,
    duration: classDoc.duration,
    schoolId: classDoc.schoolId?.toString(),
    mentorIds: (classDoc.mentorIds || []).map((mentor) => mentor._id.toString()),
    mentors: (classDoc.mentorIds || []).map((mentor) => ({
      id: mentor._id.toString(),
      name: mentor.name,
      email: mentor.email,
    })),
    studentIds: (classDoc.studentIds || []).map((student) => student._id.toString()),
    students: (classDoc.studentIds || []).map((student) => ({
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      isActive: student.isActive,
    })),
    isActive: classDoc.isActive,
    maxStudents: classDoc.maxStudents,
    createdAt: classDoc.createdAt,
    updatedAt: classDoc.updatedAt,
  };
}

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
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .sort({ createdAt: -1 })
      .lean();

    const formattedClasses = classes.map((classDoc) => formatClassDocument(classDoc as PopulatedClassDoc));

    return NextResponse.json({ classes: formattedClasses });

  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
