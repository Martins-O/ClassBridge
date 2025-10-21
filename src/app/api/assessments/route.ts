import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { getUserIdFromRequest } from '@/lib/session';

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

    const assessmentData = await request.json();

    // Validate required fields
    const { title, description, questions, schoolId, targetRole, assessorRole, assessmentType } = assessmentData;

    if (!title || !description || !questions || questions.length === 0 || !schoolId || !targetRole || !assessorRole || !assessmentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}