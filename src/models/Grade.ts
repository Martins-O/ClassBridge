import { Document, Schema, model, models } from 'mongoose';

export interface IGrade extends Document {
  studentId: Schema.Types.ObjectId;
  classId: Schema.Types.ObjectId;
  mentorId: Schema.Types.ObjectId;
  schoolId: Schema.Types.ObjectId;
  gradeType: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation' | 'final';
  title: string;
  description?: string;
  points: number; // Points earned
  maxPoints: number; // Maximum possible points
  percentage: number; // Calculated percentage
  letterGrade?: string; // A, B, C, D, F
  weight: number; // Weight in final grade calculation (0-1)
  gradedDate: Date;
  dueDate?: Date;
  isExcused: boolean;
  comments?: string;
  rubric?: {
    criteria: string;
    points: number;
    maxPoints: number;
    feedback?: string;
  }[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  calculateGrade(): void;
}

const RubricItemSchema = new Schema({
  criteria: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 0
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  _id: false
});

const GradeSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  gradeType: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'project', 'participation', 'final'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  letterGrade: {
    type: String,
    trim: true,
    uppercase: true,
    match: /^[A-F][+-]?$/
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.1
  },
  gradedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  isExcused: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  rubric: [RubricItemSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes for performance
GradeSchema.index({ studentId: 1, classId: 1 });
GradeSchema.index({ classId: 1, gradeType: 1 });
GradeSchema.index({ mentorId: 1 });
GradeSchema.index({ schoolId: 1 });
GradeSchema.index({ gradedDate: -1 });

// Calculate percentage and letter grade
GradeSchema.methods.calculateGrade = function() {
  if (this.maxPoints > 0) {
    this.percentage = parseFloat(((this.points / this.maxPoints) * 100).toFixed(2));

    // Assign letter grade based on percentage
    if (this.percentage >= 97) this.letterGrade = 'A+';
    else if (this.percentage >= 93) this.letterGrade = 'A';
    else if (this.percentage >= 90) this.letterGrade = 'A-';
    else if (this.percentage >= 87) this.letterGrade = 'B+';
    else if (this.percentage >= 83) this.letterGrade = 'B';
    else if (this.percentage >= 80) this.letterGrade = 'B-';
    else if (this.percentage >= 77) this.letterGrade = 'C+';
    else if (this.percentage >= 73) this.letterGrade = 'C';
    else if (this.percentage >= 70) this.letterGrade = 'C-';
    else if (this.percentage >= 67) this.letterGrade = 'D+';
    else if (this.percentage >= 63) this.letterGrade = 'D';
    else if (this.percentage >= 60) this.letterGrade = 'D-';
    else this.letterGrade = 'F';
  } else {
    this.percentage = 0;
    this.letterGrade = 'N/A';
  }
};

// Pre-save middleware to calculate grade
GradeSchema.pre('save', function(next) {
  if (this.isModified('points') || this.isModified('maxPoints')) {
    (this as unknown as IGrade).calculateGrade();
  }
  next();
});

const Grade = models.Grade || model<IGrade>('Grade', GradeSchema);

export default Grade;