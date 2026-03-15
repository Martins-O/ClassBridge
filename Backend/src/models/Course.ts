import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mentor ID is required']
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subject: {
    type: String,
    trim: true,
    maxlength: [50, 'Subject cannot exceed 50 characters']
  },
  duration: {
    type: String,
    enum: ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months'],
    required: [true, 'Course duration is required']
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: 30,
    min: [1, 'Maximum students must be at least 1'],
    max: [100, 'Maximum students cannot exceed 100']
  },
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
  }],
  syllabus: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CourseSchema.index({ classId: 1 });
CourseSchema.index({ mentorId: 1 });
CourseSchema.index({ studentIds: 1 });
CourseSchema.index({ isActive: 1 });
CourseSchema.index({ classId: 1, isActive: 1 });
CourseSchema.index({ mentorId: 1, isActive: 1 });

// Pre-save middleware to validate dates
CourseSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('Start date must be before end date'));
  }
  next();
});

// Virtual for enrolled student count
CourseSchema.virtual('enrolledCount').get(function() {
  return this.studentIds ? this.studentIds.length : 0;
});

// Virtual for available spots
CourseSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - (this.studentIds ? this.studentIds.length : 0);
});

// Ensure virtual fields are included in JSON output
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);