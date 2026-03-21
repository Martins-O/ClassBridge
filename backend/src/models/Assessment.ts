import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple-choice' | 'checkbox' | 'scale';
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
  weight?: number; // For weighted scoring
  category?: string; // e.g., 'technical', 'communication', 'leadership'
}

export interface IAssessment extends Document {
  title: string;
  description: string;
  questions: IAssessmentQuestion[];
  createdBy: string; // User ID (mentor or school admin)
  schoolId: string; // Reference to school
  classIds: string[]; // References to classes this assessment applies to
  targetRole: 'mentor' | 'student'; // Who is being assessed
  assessorRole: 'mentor' | 'student' | 'self'; // Who performs the assessment
  assessmentType: 'peer' | 'mentor_to_student' | 'student_to_mentor' | 'self';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  maxAttempts?: number;
  timeLimit?: number; // in minutes
  passingScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentQuestionSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['rating', 'text', 'multiple-choice', 'checkbox', 'scale']
  },
  question: { type: String, required: true },
  description: { type: String },
  options: [{ type: String }],
  required: { type: Boolean, default: true },
  weight: { type: Number, default: 1 },
  category: { type: String, trim: true }
});

const AssessmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [AssessmentQuestionSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Class'
  }],
  targetRole: {
    type: String,
    enum: ['mentor', 'student'],
    required: true
  },
  assessorRole: {
    type: String,
    enum: ['mentor', 'student', 'self'],
    required: true
  },
  assessmentType: {
    type: String,
    enum: ['peer', 'mentor_to_student', 'student_to_mentor', 'self'],
    required: true
  },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  maxAttempts: { type: Number, default: 1 },
  timeLimit: { type: Number },
  passingScore: { type: Number },
  materials: [{
    title: String,
    description: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'image'],
      default: 'document'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

AssessmentSchema.index({ schoolId: 1 });
AssessmentSchema.index({ createdBy: 1 });
AssessmentSchema.index({ targetRole: 1 });
AssessmentSchema.index({ isActive: 1, startDate: 1 });
AssessmentSchema.index({ endDate: 1 });
AssessmentSchema.index({ schoolId: 1, targetRole: 1 });
AssessmentSchema.index({ classIds: 1 });
AssessmentSchema.index({ isActive: 1, endDate: 1 });
AssessmentSchema.index({ schoolId: 1, isActive: 1, assessmentType: 1 });

export default mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
