import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Response from '@/models/Response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');
    const token = searchParams.get('token');

    if (!surveyId || !token) {
      return NextResponse.json({ error: 'Missing surveyId or token' }, { status: 400 });
    }

    const existingResponse = await Response.findOne({
      surveyId,
      respondentToken: token
    });

    if (existingResponse) {
      return NextResponse.json({
        exists: true,
        response: existingResponse
      });
    } else {
      return NextResponse.json({
        exists: false
      });
    }
  } catch (error) {
    console.error('Error checking response:', error);
    return NextResponse.json({ error: 'Failed to check response' }, { status: 500 });
  }
}