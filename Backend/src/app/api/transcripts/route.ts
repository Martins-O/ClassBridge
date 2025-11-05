import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transcript from '@/models/Transcript';
import User from '@/models/User';
import Class from '@/models/Class';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/transcripts - Fetch transcripts with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const schoolId = searchParams.get('schoolId');

    const query: Record<string, unknown> = {};

    // Role-based access control
    if (currentUser.role === 'student') {
      // Students can only view their own transcript
      query.studentId = userId;
    } else if (currentUser.role === 'mentor') {
      // Mentors can view transcripts of students in their classes
      const mentorClasses = await Class.find({ mentorIds: userId }).select('_id studentIds');
      const accessibleStudents = mentorClasses.reduce((acc: string[], cls) => {
        return acc.concat(cls.studentIds.map((id: { toString(): string }) => id.toString()));
      }, []);

      if (studentId && accessibleStudents.includes(studentId)) {
        query.studentId = studentId;
      } else {
        query.studentId = { $in: accessibleStudents };
      }
    } else if (currentUser.role === 'school_admin') {
      // School admins can view transcripts from their school
      query.schoolId = currentUser.schoolId;
      if (studentId) query.studentId = studentId;
    } else if (currentUser.role === 'super_admin') {
      // Super admins can view all transcripts
      if (studentId) query.studentId = studentId;
      if (schoolId) query.schoolId = schoolId;
    } else {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const transcripts = await Transcript.find(query)
      .populate('studentId', 'name email')
      .populate('schoolId', 'name')
      .sort({ lastUpdated: -1 });

    return NextResponse.json({ transcripts });

  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/transcripts - Create or update a transcript
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only mentors, school admins, and super admins can create/update transcripts
    if (!['mentor', 'school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only mentors and administrators can manage transcripts' },
        { status: 403 }
      );
    }

    const { studentId, courseRecord } = await request.json();

    if (!studentId || !courseRecord) {
      return NextResponse.json(
        { error: 'Student ID and course record are required' },
        { status: 400 }
      );
    }

    // Validate the student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Verify permissions for the specific student/class
    if (currentUser.role === 'mentor') {
      const classData = await Class.findById(courseRecord.classId);
      if (!classData || !classData.mentorIds.includes(userId)) {
        return NextResponse.json(
          { error: 'You can only add grades for classes you mentor' },
          { status: 403 }
        );
      }
    } else if (currentUser.role === 'school_admin') {
      if (student.schoolId?.toString() !== currentUser.schoolId?.toString()) {
        return NextResponse.json(
          { error: 'You can only manage transcripts for students in your school' },
          { status: 403 }
        );
      }
    }

    // Find or create transcript
    let transcript = await Transcript.findOne({ studentId });

    if (!transcript) {
      // Create new transcript
      transcript = new Transcript({
        studentId,
        schoolId: student.schoolId,
        studentInfo: {
          name: student.name,
          email: student.email,
          studentNumber: student.studentId || 'N/A',
          enrollmentDate: student.createdAt
        },
        courseRecords: [courseRecord]
      });
    } else {
      // Update existing transcript
      const existingRecordIndex = transcript.courseRecords.findIndex(
        (record: { classId: { toString(): string } }) => record.classId.toString() === courseRecord.classId
      );

      if (existingRecordIndex >= 0) {
        // Update existing course record
        transcript.courseRecords[existingRecordIndex] = courseRecord;
      } else {
        // Add new course record
        transcript.courseRecords.push(courseRecord);
      }
    }

    await transcript.save();

    return NextResponse.json({
      message: 'Transcript updated successfully',
      transcript
    });

  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
