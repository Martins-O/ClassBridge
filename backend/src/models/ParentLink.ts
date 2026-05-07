import mongoose, { Schema, Document } from 'mongoose';

export interface IParentLink extends Document {
  parentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ParentLinkSchema = new Schema({
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  relationship: {
    type: String,
    enum: ['mother', 'father', 'guardian', 'other'],
    default: 'guardian'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

ParentLinkSchema.index({ parentId: 1, studentId: 1 }, { unique: true });
ParentLinkSchema.index({ studentId: 1, isActive: 1 });

export default mongoose.models.ParentLink || mongoose.model<IParentLink>('ParentLink', ParentLinkSchema);
