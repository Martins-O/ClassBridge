import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  description?: string;
  schoolId: string; // Reference to the school
  teacherIds: string[]; // References to mentor/teacher users
  studentIds: string[]; // References to student users
  subject?: string;
  grade?: string;
  academicYear: string;
  semester?: string;
  isActive: boolean;
  maxStudents?: number;
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
  teacherIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  studentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  subject: {
    type: String,
    trim: true
  },
  grade: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
