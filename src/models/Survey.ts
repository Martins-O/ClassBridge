import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  id: string;
  type: 'text' | 'single-choice' | 'multiple-choice' | 'checkbox' | 'rating';
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
  ratingConfig?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

export interface ISurvey extends Document {
  title: string;
  description: string;
  questions: IQuestion[];
  uniqueId: string;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['text', 'single-choice', 'multiple-choice', 'checkbox', 'rating']
  },
  question: { type: String, required: true },
  description: { type: String },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
  ratingConfig: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 },
    minLabel: { type: String },
    maxLabel: { type: String }
  }
});

const SurveySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [QuestionSchema],
  uniqueId: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Survey || mongoose.model<ISurvey>('Survey', SurveySchema);