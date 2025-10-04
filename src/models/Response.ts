import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionId: string;
  answer: string | string[];
}

export interface IResponse extends Document {
  surveyId: string;
  respondentToken: string;
  answers: IAnswer[];
  submittedAt: Date;
}

const AnswerSchema = new Schema({
  questionId: { type: String, required: true },
  answer: { type: Schema.Types.Mixed, required: true }
});

const ResponseSchema = new Schema({
  surveyId: { type: String, required: true },
  respondentToken: { type: String, required: true },
  answers: [AnswerSchema],
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Response || mongoose.model<IResponse>('Response', ResponseSchema);