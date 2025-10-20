import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

// POST /api/schools - Register a new school
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, phone, address, website, description, adminId } = body;

    // Validate required fields
    if (!name || !email || !adminId) {
      return NextResponse.json(
        { error: 'Name, email, and admin ID are required' },
        { status: 400 }
      );
    }

    // Check if school email already exists
    const existingSchool = await School.findOne({ email: email.toLowerCase() });
    if (existingSchool) {
      return NextResponse.json(
        { error: 'School with this email already exists' },
        { status: 400 }
      );
    }

    // Check if admin user exists and update their role
    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Create new school
    const school = new School({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      website,
      description,
      adminId: adminUser._id // Use ObjectId instead of string
    });

    await school.save();

    // Update admin user role to school_admin and associate with school
    adminUser.role = 'school_admin';
    adminUser.schoolId = school._id;
    await adminUser.save();

    return NextResponse.json({
      message: 'School registered successfully',
      school: {
        id: school._id,
        name: school.name,
        email: school.email,
        adminId: school.adminId
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering school:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/schools - Fetch schools
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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let schools;

    // Filter schools based on user role
    if (user.role === 'super_admin') {
      // Super admin can see all schools
      schools = await School.find().populate('adminId');
    } else if (user.role === 'school_admin') {
      // School admin can only see their own school
      schools = await School.find({ _id: user.schoolId }).populate('adminId');
    } else {
      // Other roles can see all schools for selection purposes
      schools = await School.find().select('name _id');
    }

    return NextResponse.json({ schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
