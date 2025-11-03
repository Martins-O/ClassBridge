import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentInvitation extends Document {
  email: string;
  name: string;
  schoolId: string;
  classId: string;
  invitedBy: string; // User ID of who sent the invitation
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

const StudentInvitationSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  acceptedAt: {
    type: Date
  }
});

// Create indexes for better performance
StudentInvitationSchema.index({ email: 1, classId: 1 });
StudentInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.StudentInvitation || mongoose.model<IStudentInvitation>('StudentInvitation', StudentInvitationSchema);
