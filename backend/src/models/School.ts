import mongoose, { Schema, Document } from 'mongoose';

export type SchoolStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface ISchool extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  adminId: mongoose.Types.ObjectId;
  approvalId?: mongoose.Types.ObjectId;
  status: SchoolStatus;
  isActive: boolean;
  subscriptionType: 'basic' | 'premium' | 'enterprise';
  rejectionReason?: string;
  suspendedAt?: Date;
  suspendedBy?: mongoose.Types.ObjectId;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvalId: {
    type: Schema.Types.ObjectId,
    ref: 'SchoolApproval'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionType: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  suspendedAt: {
    type: Date
  },
  suspendedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  suspensionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

SchoolSchema.index({ adminId: 1 });
SchoolSchema.index({ isActive: 1 });
SchoolSchema.index({ subscriptionType: 1, isActive: 1 });
SchoolSchema.index({ status: 1 });
SchoolSchema.index({ approvalId: 1 });
SchoolSchema.index({ suspendedAt: 1 });

export default mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);
