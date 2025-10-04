import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Survey from '@/models/Survey';
import Response from '@/models/Response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const survey = await Survey.findOne({ uniqueId: id });

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Check authentication
    const userId = request.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find the survey and check ownership
    const survey = await Survey.findOne({ uniqueId: id, createdBy: userId });

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found or access denied' },
        { status: 404 }
      );
    }

    // Delete all responses associated with this survey
    await Response.deleteMany({ surveyId: id });

    // Delete the survey itself
    await Survey.deleteOne({ uniqueId: id });

    return NextResponse.json({
      success: true,
      message: 'Survey and all associated responses deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json(
      { error: 'Failed to delete survey' },
      { status: 500 }
    );
  }
}