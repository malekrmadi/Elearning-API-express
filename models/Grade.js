const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide a student ID']
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: [true, 'Please provide a classroom ID']
  },
  assignmentName: {
    type: String,
    required: [true, 'Please provide an assignment name'],
    trim: true
  },
  assignmentType: {
    type: String,
    enum: ['quiz', 'exam', 'homework', 'project', 'participation', 'midterm', 'final', 'other'],
    required: [true, 'Please specify the assignment type']
  },
  score: {
    type: Number,
    required: [true, 'Please provide a score']
  },
  maxScore: {
    type: Number,
    required: [true, 'Please provide the maximum possible score']
  },
  weightage: {
    type: Number,
    default: 1,
    min: 0,
    max: 100
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  lateSubmission: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for percentage score
GradeSchema.virtual('percentage').get(function() {
  return (this.score / this.maxScore * 100).toFixed(2);
});

// Method to check if submission is late
GradeSchema.pre('save', function(next) {
  if (this.dueDate && this.submissionDate > this.dueDate) {
    this.lateSubmission = true;
  }
  next();
});

// Index for faster queries
GradeSchema.index({ studentId: 1, classroomId: 1 });
GradeSchema.index({ classroomId: 1 });
GradeSchema.index({ studentId: 1 });
GradeSchema.index({ assignmentType: 1 });

module.exports = mongoose.model('Grade', GradeSchema);