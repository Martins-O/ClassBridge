import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  adminId: string; // Reference to the user who created the school
  isActive: boolean;
  subscriptionType: 'basic' | 'premium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema({
  name: {
    type: String,
    required: true,
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
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionType: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  }
}, {
  timestamps: true
});

SchoolSchema.index({ adminId: 1 });
SchoolSchema.index({ isActive: 1 });
SchoolSchema.index({ subscriptionType: 1, isActive: 1 });

export default mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);
