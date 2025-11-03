import { Document, Schema, model, models } from 'mongoose';

export interface IMentorInvitation extends Document {
  email: string;
  name: string;
  schoolId: Schema.Types.ObjectId;
  invitedBy: Schema.Types.ObjectId;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MentorInvitationSchema = new Schema({
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
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
MentorInvitationSchema.index({ email: 1, schoolId: 1 });
MentorInvitationSchema.index({ status: 1 });
// Remove expired invitations automatically
MentorInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MentorInvitation = models.MentorInvitation || model<IMentorInvitation>('MentorInvitation', MentorInvitationSchema);

export default MentorInvitation;
