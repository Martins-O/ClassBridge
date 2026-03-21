import mongoose, { Schema, Document } from 'mongoose';

export type DeletionStatus = 'pending' | 'approved' | 'rejected';

export interface IDeletionRequest extends Document {
  userId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  reason?: string;
  requestedAt: Date;
  status: DeletionStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeletionRequestSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    trim: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

DeletionRequestSchema.index({ status: 1, schoolId: 1 });
DeletionRequestSchema.index({ userId: 1 });
DeletionRequestSchema.index({ requestedBy: 1 });
DeletionRequestSchema.index({ schoolId: 1, status: 1 });
DeletionRequestSchema.index({ requestedAt: -1 });

export default mongoose.models.DeletionRequest || mongoose.model<IDeletionRequest>('DeletionRequest', DeletionRequestSchema);
