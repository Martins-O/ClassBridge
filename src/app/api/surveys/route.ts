import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Survey from '@/models/Survey';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { title, description, questions } = await request.json();

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one question are required' },
        { status: 400 }
      );
    }

    const survey = new Survey({
      title,
      description,
      questions,
      uniqueId: uuidv4()
    });

    await survey.save();

    return NextResponse.json({
      success: true,
      survey: {
        id: survey._id,
        uniqueId: survey.uniqueId,
        title: survey.title,
        description: survey.description,
        createdAt: survey.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    return NextResponse.json(
      { error: 'Failed to create survey' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const surveys = await Survey.find({})
      .select('title description uniqueId createdAt questions')
      .sort({ createdAt: -1 });

    return NextResponse.json({ surveys });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}