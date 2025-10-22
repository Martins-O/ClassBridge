import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import AssessmentAttempt from '@/models/AssessmentAttempt';
import { getUserIdFromRequest } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;

    // Check authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { respondentId, classId } = await request.json();

    // Get assessment
    const assessment = await Assessment.findById(resolvedParams.id);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check if assessment is active and within date range
    if (!assessment.isActive) {
      return NextResponse.json(
        { error: 'Assessment is not active' },
        { status: 400 }
      );
    }

    if (assessment.startDate && new Date() < assessment.startDate) {
      return NextResponse.json(
        { error: 'Assessment has not started yet' },
        { status: 400 }
      );
    }

    if (assessment.endDate && new Date() > assessment.endDate) {
      return NextResponse.json(
        { error: 'Assessment has ended' },
        { status: 400 }
      );
    }

    // Check existing attempts
    const existingAttempts = await AssessmentAttempt.countDocuments({
      assessmentId: resolvedParams.id,
      respondentId: respondentId || userId
    });

    if (assessment.maxAttempts && existingAttempts >= assessment.maxAttempts) {
      return NextResponse.json(
        { error: 'Maximum attempts reached' },
        { status: 400 }
      );
    }

    // Create new attempt
    const attempt = new AssessmentAttempt({
      assessmentId: resolvedParams.id,
      respondentId: respondentId || userId,
      assessorId: userId,
      schoolId: assessment.schoolId,
      classId: classId,
      answers: [],
      attemptNumber: existingAttempts + 1,
      startedAt: new Date(),
      isComplete: false
    });

    await attempt.save();

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt
      }
    });
  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Failed to start assessment attempt' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;

    // Check authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const respondentId = searchParams.get('respondentId');

    // Build query
    const query: { assessmentId: string; respondentId?: string; assessorId?: string } = { assessmentId: resolvedParams.id };

    if (respondentId) {
      query.respondentId = respondentId;
    } else {
      // If no specific respondent, show attempts where user is assessor
      query.assessorId = userId;
    }

    const attempts = await AssessmentAttempt.find(query)
      .populate('respondentId', 'name email')
      .populate('assessorId', 'name email')
      .sort({ startedAt: -1 });

    return NextResponse.json({ attempts });
  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Failed to fetch assessment attempts' },
      { status: 500 }
    );
  }
}
