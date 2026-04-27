import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 
  | 'system_admin'
  | 'school_admin'
  | 'pending_school_admin'
  | 'mentor'
  | 'student'
  | 'admissions'
  | 'counselor'
  | 'office_staff';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  schoolId?: string;
  classIds: string[];
  studentId?: string;
  isActive: boolean;
  isApproved: boolean;
  profileImage?: string;
  phone?: string;
  bio?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  lastFailedLogin?: Date;
  deletionRequested: boolean;
  deletionRequestedBy?: mongoose.Types.ObjectId;
  deletionRequestedAt?: Date;
  passwordChangedAt?: Date;
  passwordExpired: boolean;
  remindersSent: number;
  requirePasswordChange: boolean;
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
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['system_admin', 'school_admin', 'mentor', 'student', 'admissions', 'counselor', 'office_staff'],
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
    sparse: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
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
  }],
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockoutUntil: {
    type: Date,
    default: null
  },
  lastFailedLogin: {
    type: Date,
    default: null
  },
  deletionRequested: {
    type: Boolean,
    default: false
  },
  deletionRequestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deletionRequestedAt: {
    type: Date
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  passwordExpired: {
    type: Boolean,
    default: false
  },
  remindersSent: {
    type: Number,
    default: 0
  },
  requirePasswordChange: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

UserSchema.index({ schoolId: 1, role: 1 });
UserSchema.index({ classIds: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ schoolId: 1, isActive: 1 });
UserSchema.index({ lockoutUntil: 1 }, { sparse: true });
UserSchema.index({ lockoutUntil: 1, isActive: 1 });
UserSchema.index({ deletionRequested: 1, schoolId: 1 });
UserSchema.index({ role: 1, isApproved: 1 });
UserSchema.index({ passwordChangedAt: 1 });
UserSchema.index({ passwordExpired: 1, isActive: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
