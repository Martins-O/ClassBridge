import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import AssessmentAttempt from '@/models/AssessmentAttempt';
import { getUserIdFromRequest } from '@/lib/session';

export async function PUT(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
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

    const { answers, isComplete = false } = await request.json();

    // Get attempt
    const attempt = await AssessmentAttempt.findById(params.attemptId);
    if (!attempt) {
      return NextResponse.json(
        { error: 'Assessment attempt not found' },
        { status: 404 }
      );
    }

    // Check authorization (user must be the assessor)
    if (attempt.assessorId.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get assessment for scoring
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Calculate score if completing
    let score = 0;
    let maxScore = 0;
    let percentage = 0;
    let passed = false;

    if (isComplete && answers && answers.length > 0) {
      // Calculate score based on question weights and types
      for (const question of assessment.questions) {
        const weight = question.weight || 1;
        maxScore += weight;

        const answer = answers.find((a: any) => a.questionId === question.id);
        if (answer) {
          // Score based on question type
          switch (question.type) {
            case 'rating':
            case 'scale':
              if (typeof answer.answer === 'number') {
                score += (answer.answer * weight);
              }
              break;
            case 'multiple-choice':
              // For multiple choice, give full points if answered
              if (answer.answer) {
                score += weight;
              }
              break;
            case 'checkbox':
              // For checkbox, give points based on selection
              if (Array.isArray(answer.answer) && answer.answer.length > 0) {
                score += weight;
              }
              break;
            case 'text':
              // For text, give full points if answered (manual review may be needed)
              if (answer.answer && answer.answer.trim()) {
                score += weight;
              }
              break;
          }
        }
      }

      percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      passed = assessment.passingScore ? percentage >= assessment.passingScore : true;
    }

    // Update attempt
    const updateData: any = {
      answers: answers || attempt.answers,
      timeSpent: Math.floor((new Date().getTime() - attempt.startedAt.getTime()) / 1000)
    };

    if (isComplete) {
      updateData.isComplete = true;
      updateData.submittedAt = new Date();
      updateData.score = score;
      updateData.maxScore = maxScore;
      updateData.percentage = percentage;
      updateData.passed = passed;
    }

    const updatedAttempt = await AssessmentAttempt.findByIdAndUpdate(
      params.attemptId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt
    });
  } catch (error) {
    console.error('Error updating assessment attempt:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment attempt' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
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

    const attempt = await AssessmentAttempt.findById(params.attemptId)
      .populate('assessmentId')
      .populate('respondentId', 'name email')
      .populate('assessorId', 'name email');

    if (!attempt) {
      return NextResponse.json(
        { error: 'Assessment attempt not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (attempt.assessorId._id.toString() !== userId && attempt.respondentId._id.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error('Error fetching assessment attempt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment attempt' },
      { status: 500 }
    );
  }
}