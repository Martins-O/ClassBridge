import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/classbridge-development';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@classbridge.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Super Admin already established.');
      process.exit(0);
    }

    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@classbridge2024';
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new User({
      email: adminEmail,
      name: process.env.SUPER_ADMIN_NAME || 'System Administrator',
      role: 'system_admin',
      password: hashedPassword,
      isActive: true,
      isApproved: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    await admin.save();
    console.log('Super Admin successfully established.');
    process.exit(0);
  } catch (error) {
    console.error('Establishment failed:', error);
    process.exit(1);
  }
}

seedAdmin();
