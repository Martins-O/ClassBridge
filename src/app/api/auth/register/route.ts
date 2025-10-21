import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import {
  ValidationResult,
  validateString,
  validateEmail,
  validateEnum,
  sanitizeString,
  sanitizeEmail
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userData = await request.json();

    // Comprehensive validation
    const validation = new ValidationResult();

    validation.errors.push(...validateString(userData.name, 'name', { required: true, minLength: 2, maxLength: 100 }));
    validation.errors.push(...validateEmail(userData.email, 'email'));
    validation.errors.push(...validateString(userData.password, 'password', { required: true, minLength: 6, maxLength: 128 }));

    if (userData.role) {
      validation.errors.push(...validateEnum(userData.role, 'role', ['student', 'mentor', 'school_admin']));
    }

    if (!validation.isValid()) {
      return validation.getResponse();
    }

    // Sanitize inputs
    const name = sanitizeString(userData.name);
    const email = sanitizeEmail(userData.email);
    const password = userData.password;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'school_admin' // Direct registration creates school administrators
    });

    await user.save();

    // Return user without password
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    // Error handling removed for production
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}