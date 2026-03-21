import mongoose, { Schema, Document } from 'mongoose';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ISchoolApproval extends Document {
  schoolId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  schoolName: string;
  schoolEmail: string;
  requestedAt: Date;
  status: ApprovalStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolApprovalSchema = new Schema({
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolName: {
    type: String,
    required: true,
    trim: true
  },
  schoolEmail: {
    type: String,
    required: true,
    lowercase: true,
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

SchoolApprovalSchema.index({ status: 1 });
SchoolApprovalSchema.index({ requestedBy: 1 });
SchoolApprovalSchema.index({ schoolEmail: 1 });
SchoolApprovalSchema.index({ requestedAt: -1 });

export default mongoose.models.SchoolApproval || mongoose.model<ISchoolApproval>('SchoolApproval', SchoolApprovalSchema);
