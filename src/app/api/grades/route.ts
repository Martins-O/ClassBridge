import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Grade from '@/models/Grade';
import User from '@/models/User';
import Class from '@/models/Class';
import Transcript from '@/models/Transcript';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/grades - Fetch grades with filtering
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
    const classId = searchParams.get('classId');
    const gradeType = searchParams.get('gradeType');

    const query: Record<string, unknown> = {};

    // Role-based access control
    if (currentUser.role === 'student') {
      query.studentId = userId;
      if (classId) query.classId = classId;
    } else if (currentUser.role === 'mentor') {
      const mentorClasses = await Class.find({ mentorIds: userId }).select('_id');
      const mentorClassIds = mentorClasses.map(cls => cls._id.toString());

      query.classId = { $in: mentorClassIds };
      if (studentId) query.studentId = studentId;
      if (classId && mentorClassIds.includes(classId)) query.classId = classId;
    } else if (currentUser.role === 'school_admin') {
      query.schoolId = currentUser.schoolId;
      if (studentId) query.studentId = studentId;
      if (classId) query.classId = classId;
    } else if (currentUser.role === 'super_admin') {
      if (studentId) query.studentId = studentId;
      if (classId) query.classId = classId;
    } else {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (gradeType) query.gradeType = gradeType;

    const grades = await Grade.find(query)
      .populate('studentId', 'name email studentId')
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name')
      .sort({ gradedDate: -1 });

    return NextResponse.json({ grades });

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/grades - Create a new grade
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

    // Only mentors, school admins, and super admins can create grades
    if (!['mentor', 'school_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only mentors and administrators can create grades' },
        { status: 403 }
      );
    }

    const gradeData = await request.json();
    const { studentId, classId, gradeType, title, points, maxPoints, weight, comments, rubric, dueDate } = gradeData;

    // Validate required fields
    if (!studentId || !classId || !gradeType || !title || points === undefined || !maxPoints) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate student and class exist
    const student = await User.findById(studentId);
    const classData = await Class.findById(classId);

    if (!student || student.role !== 'student') {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Verify permissions
    if (currentUser.role === 'mentor') {
      if (!classData.mentorIds.includes(userId)) {
        return NextResponse.json(
          { error: 'You can only create grades for classes you mentor' },
          { status: 403 }
        );
      }
    } else if (currentUser.role === 'school_admin') {
      if (classData.schoolId.toString() !== currentUser.schoolId?.toString()) {
        return NextResponse.json(
          { error: 'You can only create grades for classes in your school' },
          { status: 403 }
        );
      }
    }

    // Create new grade
    const newGrade = new Grade({
      studentId,
      classId,
      mentorId: userId,
      schoolId: classData.schoolId,
      gradeType,
      title,
      points: parseFloat(points),
      maxPoints: parseFloat(maxPoints),
      weight: weight || 0.1,
      comments,
      rubric,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: 'published'
    });

    await newGrade.save();

    // Update transcript if this is a final grade
    if (gradeType === 'final') {
      await updateTranscriptWithFinalGrade(studentId, classId, newGrade);
    }

    return NextResponse.json({
      message: 'Grade created successfully',
      grade: newGrade
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update transcript with final grade
async function updateTranscriptWithFinalGrade(studentId: string, classId: string, finalGrade: { mentorId: string; letterGrade?: string; comments?: string }) {
  try {
    const student = await User.findById(studentId);
    const classData = await Class.findById(classId);
    const mentor = await User.findById(finalGrade.mentorId);

    if (!student || !classData || !mentor) return;

    const courseRecord = {
      classId: classData._id,
      className: classData.name,
      academicYear: classData.academicYear,
      duration: classData.duration || 'N/A',
      cohort: classData.cohort || 'N/A',
      grade: finalGrade.letterGrade || 'N/A',
      credits: 3, // Default credits, could be made configurable
      mentorId: mentor._id,
      mentorName: mentor.name,
      completedDate: new Date(),
      notes: finalGrade.comments
    };

    let transcript = await Transcript.findOne({ studentId });

    if (!transcript) {
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
      const existingIndex = transcript.courseRecords.findIndex(
        (record: { classId: { toString(): string } }) => record.classId.toString() === classId
      );

      if (existingIndex >= 0) {
        transcript.courseRecords[existingIndex] = courseRecord;
      } else {
        transcript.courseRecords.push(courseRecord);
      }
    }

    await transcript.save();
  } catch (error) {
    console.error('Error updating transcript:', error);
  }
}
