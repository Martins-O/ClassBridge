import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  description?: string;
  schoolId: string; // Reference to the school
  mentorIds: string[]; // References to mentor users
  studentIds: string[]; // References to student users
  academicYear: string;
  duration: string; // e.g., "3 months", "1 semester", "6 weeks"
  cohort: string; // e.g., "Spring 2024", "Cohort A", "Batch 1"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  mentorIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  studentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  cohort: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

ClassSchema.index({ schoolId: 1, academicYear: 1 });
ClassSchema.index({ schoolId: 1, isActive: 1 });
ClassSchema.index({ mentorIds: 1 });
ClassSchema.index({ studentIds: 1 });
ClassSchema.index({ academicYear: 1, cohort: 1 });
ClassSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
