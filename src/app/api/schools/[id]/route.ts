import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

// GET /api/schools/[id] - Get a specific school
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const school = await School.findById(id).populate('adminId', 'name email');
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this school
    let hasAccess = false;

    if (user.role === 'super_admin') {
      hasAccess = true;
    } else if (user.role === 'school_admin') {
      hasAccess = school._id.toString() === user.schoolId?.toString();
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ school });

  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/schools/[id] - Update school information
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, address, website, description, subscriptionType } = body;

    const school = await School.findById(id);
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it conflicts
    if (email && email !== school.email) {
      const existingSchool = await School.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingSchool) {
        return NextResponse.json(
          { error: 'Email already in use by another school' },
          { status: 400 }
        );
      }
      school.email = email.toLowerCase();
    }

    // Update fields
    if (name) school.name = name;
    if (phone !== undefined) school.phone = phone;
    if (address !== undefined) school.address = address;
    if (website !== undefined) school.website = website;
    if (description !== undefined) school.description = description;
    if (subscriptionType) school.subscriptionType = subscriptionType;

    await school.save();

    return NextResponse.json({
      message: 'School updated successfully',
      school: {
        id: school._id,
        name: school.name,
        email: school.email
      }
    });

  } catch {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
