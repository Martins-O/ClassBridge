import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentAnswer {
  questionId: string;
  answer: string | string[] | number;
  timeSpent?: number; // in seconds
}

export interface IAssessmentAttempt extends Document {
  assessmentId: string;
  respondentId: string; // User being assessed
  assessorId: string; // User performing the assessment
  schoolId: string;
  classId?: string;
  answers: IAssessmentAnswer[];
  score?: number;
  maxScore?: number;
  percentage?: number;
  passed?: boolean;
  startedAt: Date;
  submittedAt?: Date;
  timeSpent?: number; // in seconds
  attemptNumber: number;
  isComplete: boolean;
}

const AssessmentAnswerSchema = new Schema({
  questionId: { type: String, required: true },
  answer: { type: Schema.Types.Mixed, required: true }, // Can be string, array, or number
  timeSpent: { type: Number }
});

const AssessmentAttemptSchema = new Schema({
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  respondentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class'
  },
  answers: [AssessmentAnswerSchema],
  score: { type: Number },
  maxScore: { type: Number },
  percentage: { type: Number },
  passed: { type: Boolean },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeSpent: { type: Number },
  attemptNumber: { type: Number, default: 1 },
  isComplete: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for efficient queries
AssessmentAttemptSchema.index({ assessmentId: 1, respondentId: 1, attemptNumber: 1 });
AssessmentAttemptSchema.index({ assessorId: 1, submittedAt: -1 });
AssessmentAttemptSchema.index({ schoolId: 1, classId: 1 });

export default mongoose.models.AssessmentAttempt || mongoose.model<IAssessmentAttempt>('AssessmentAttempt', AssessmentAttemptSchema);
