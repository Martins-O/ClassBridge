import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';
import User from '@/models/User';

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
