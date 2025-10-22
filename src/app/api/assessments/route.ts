import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';
import {
  ValidationResult,
  validateString,
  validateArray,
  validateObjectId,
  validateEnum,
  validateNumber
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only school admins, mentors, and super admins can create assessments
    if (!['school_admin', 'mentor', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only school administrators and mentors can create assessments' },
        { status: 403 }
      );
    }

    const assessmentData = await request.json();

    // Comprehensive validation
    const validation = new ValidationResult();

    // Validate basic fields
    validation.errors.push(...validateString(assessmentData.title, 'title', { required: true, minLength: 3, maxLength: 200 }));
    validation.errors.push(...validateString(assessmentData.description, 'description', { required: true, minLength: 10, maxLength: 1000 }));
    validation.errors.push(...validateObjectId(assessmentData.schoolId, 'schoolId'));
    validation.errors.push(...validateEnum(assessmentData.targetRole, 'targetRole', ['mentor', 'student']));
    validation.errors.push(...validateEnum(assessmentData.assessorRole, 'assessorRole', ['mentor', 'student', 'self']));
    validation.errors.push(...validateEnum(assessmentData.assessmentType, 'assessmentType', ['peer', 'mentor_to_student', 'student_to_mentor', 'self']));

    // Validate questions array
    validation.errors.push(...validateArray(assessmentData.questions, 'questions', {
      required: true,
      minLength: 1,
      maxLength: 50,
      itemValidator: (question: { question: unknown; type: unknown; options?: unknown }) => {
        const questionErrors: string[] = [];

        const questionText = question.question;
        const questionType = question.type;

        questionErrors.push(
          ...validateString(questionText, 'question', { required: true, minLength: 5, maxLength: 500 })
        );
        questionErrors.push(
          ...validateEnum(questionType, 'type', ['multiple-choice', 'checkbox', 'text', 'rating', 'scale'])
        );

        if (questionType === 'multiple-choice' || questionType === 'checkbox') {
          questionErrors.push(
            ...validateArray(question.options, 'options', { required: true, minLength: 2, maxLength: 10 })
          );
        }

        return questionErrors;
      }
    }));

    // Validate optional numeric fields
    if (assessmentData.timeLimit !== undefined) {
      validation.errors.push(...validateNumber(assessmentData.timeLimit, 'timeLimit', { min: 1, max: 480, integer: true }));
    }
    if (assessmentData.maxAttempts !== undefined) {
      validation.errors.push(...validateNumber(assessmentData.maxAttempts, 'maxAttempts', { min: 1, max: 10, integer: true }));
    }
    if (assessmentData.passingScore !== undefined) {
      validation.errors.push(...validateNumber(assessmentData.passingScore, 'passingScore', { min: 0, max: 100, integer: true }));
    }

    if (!validation.isValid()) {
      return validation.getResponse();
    }

    // Create assessment
    const assessment = new Assessment({
      ...assessmentData,
      createdBy: userId,
      isActive: true
    });

    await assessment.save();

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        assessmentType: assessment.assessmentType,
        targetRole: assessment.targetRole,
        assessorRole: assessment.assessorRole,
        isActive: assessment.isActive,
        createdAt: assessment.createdAt
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const assessmentType = searchParams.get('assessmentType');

    // Build query
    const query: {
      createdBy: string;
      schoolId?: string;
      classIds?: { $in: string[] };
      assessmentType?: string;
    } = { createdBy: userId };

    if (schoolId) {
      query.schoolId = schoolId;
    }

    if (classId) {
      query.classIds = { $in: [classId] };
    }

    if (assessmentType) {
      query.assessmentType = assessmentType;
    }

    const assessments = await Assessment.find(query)
      .populate('schoolId', 'name')
      .populate('classIds', 'name subject')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ assessments });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
