import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'school_admin' | 'mentor' | 'student' | 'super_admin';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  schoolId?: string;
  classIds: string[];
  studentId?: string;
  isActive: boolean;
  profileImage?: string;
  phone?: string;
  bio?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
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
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  backupCodes: [{
    type: String,
    select: false
  }]
}, {
  timestamps: true
});

// Index for faster queries
UserSchema.index({ schoolId: 1, role: 1 });
UserSchema.index({ classIds: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ schoolId: 1, isActive: 1 });
UserSchema.index({ studentId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);