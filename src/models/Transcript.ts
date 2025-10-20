import { Document, Schema, model, models } from 'mongoose';

export interface ICourseRecord extends Document {
  classId: Schema.Types.ObjectId;
  className: string;
  academicYear: string;
  duration: string;
  cohort: string;
  grade: string; // Final grade (A, B, C, D, F, or custom scale)
  credits: number; // Credit hours for the course
  mentorId: Schema.Types.ObjectId;
  mentorName: string;
  completedDate: Date;
  notes?: string; // Additional notes from mentor
}

export interface ITranscript extends Document {
  studentId: Schema.Types.ObjectId;
  schoolId: Schema.Types.ObjectId;
  studentInfo: {
    name: string;
    email: string;
    studentNumber: string;
    enrollmentDate: Date;
  };
  courseRecords: ICourseRecord[];
  academicSummary: {
    totalCredits: number;
    gpa: number; // Grade Point Average
    overallGrade: string; // Overall academic standing
  };
  isActive: boolean;
  generatedAt: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  calculateGPA(): number;
  updateAcademicSummary(): void;
}

const CourseRecordSchema = new Schema({
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  className: {
    type: String,
    required: true,
    trim: true
  },
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
  grade: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  credits: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorName: {
    type: String,
    required: true,
    trim: true
  },
  completedDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  _id: true
});

const TranscriptSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  studentInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    studentNumber: {
      type: String,
      required: true,
      trim: true
    },
    enrollmentDate: {
      type: Date,
      required: true
    }
  },
  courseRecords: [CourseRecordSchema],
  academicSummary: {
    totalCredits: {
      type: Number,
      default: 0,
      min: 0
    },
    gpa: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 4.0
    },
    overallGrade: {
      type: String,
      default: 'N/A',
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
TranscriptSchema.index({ studentId: 1 });
TranscriptSchema.index({ schoolId: 1 });
TranscriptSchema.index({ 'studentInfo.studentNumber': 1 });
TranscriptSchema.index({ 'courseRecords.classId': 1 });

// Methods to calculate GPA and academic summary
TranscriptSchema.methods.calculateGPA = function() {
  if (this.courseRecords.length === 0) {
    return 0.0;
  }

  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };

  let totalPoints = 0;
  let totalCredits = 0;

  this.courseRecords.forEach((record: ICourseRecord) => {
    const points = gradePoints[record.grade as keyof typeof gradePoints] || 0;
    totalPoints += points * record.credits;
    totalCredits += record.credits;
  });

  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0.0;
};

TranscriptSchema.methods.updateAcademicSummary = function() {
  const totalCredits = this.courseRecords.reduce((sum: number, record: ICourseRecord) => sum + record.credits, 0);
  const gpa = this.calculateGPA();

  let overallGrade = 'N/A';
  if (gpa >= 3.7) overallGrade = 'Excellent';
  else if (gpa >= 3.0) overallGrade = 'Good';
  else if (gpa >= 2.0) overallGrade = 'Satisfactory';
  else if (gpa >= 1.0) overallGrade = 'Below Average';
  else if (gpa > 0) overallGrade = 'Poor';

  this.academicSummary = {
    totalCredits,
    gpa,
    overallGrade
  };

  this.lastUpdated = new Date();
};

// Pre-save middleware to update academic summary
TranscriptSchema.pre('save', function(next) {
  if (this.isModified('courseRecords')) {
    (this as unknown as ITranscript).updateAcademicSummary();
  }
  next();
});

const Transcript = models.Transcript || model<ITranscript>('Transcript', TranscriptSchema);

export default Transcript;