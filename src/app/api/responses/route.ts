import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Response from '@/models/Response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { surveyId, answers, respondentToken } = await request.json();

    if (!surveyId || !answers || answers.length === 0) {
      return NextResponse.json(
        { error: 'Survey ID and answers are required' },
        { status: 400 }
      );
    }

    // Check if response already exists for this token
    if (respondentToken) {
      const existingResponse = await Response.findOne({
        surveyId,
        respondentToken
      });

      if (existingResponse) {
        return NextResponse.json(
          { error: 'Response already submitted for this link' },
          { status: 409 }
        );
      }
    }

    const response = new Response({
      surveyId,
      answers,
      respondentToken: respondentToken || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await response.save();

    return NextResponse.json({
      success: true,
      message: 'Response submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');

    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const responses = await Response.find({ surveyId }).sort({ submittedAt: -1 });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}