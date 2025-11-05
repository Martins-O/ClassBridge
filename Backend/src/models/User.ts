import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'school_admin' | 'mentor' | 'student' | 'super_admin';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  schoolId?: string; // Reference to school (for school_admin, mentor, student)
  classIds: string[]; // References to classes (for mentors and students)
  studentId?: string; // Auto-generated student ID (for students only)
  isActive: boolean;
  profileImage?: string;
  phone?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['school_admin', 'mentor', 'student', 'super_admin'],
    required: true,
    default: 'student'
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School'
  },
  classIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Class'
  }],
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Only students will have this field
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
UserSchema.index({ schoolId: 1, role: 1 });
UserSchema.index({ classIds: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);