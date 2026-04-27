import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dotenv from 'dotenv';
dotenv.config();

async function createSchoolAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classbridge-development');
  
  const email = 'schooladmin@test.com';
  const password = 'Password@123';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = new User({
    email,
    name: 'Test School Admin',
    role: 'school_admin',
    password: hashedPassword,
    isActive: true,
    isApproved: true,
    schoolId: new mongoose.Types.ObjectId(), // Fake school ID
  });
  
  await User.deleteOne({ email });
  await user.save();
  console.log('Created School Admin:', email, password);
  process.exit(0);
}
createSchoolAdmin();
