const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a classroom name'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject']
  },
  gradeLevel: {
    type: String,
    required: [true, 'Please provide a grade level']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Please provide a teacher']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  schedule: [{
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String,
    location: String
  }],
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer', 'Winter', 'Year-round'],
    required: [true, 'Please specify the semester']
  },
  year: {
    type: Number,
    required: [true, 'Please specify the academic year']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  syllabus: {
    type: String
  },
  maxCapacity: {
    type: Number
  },
  credits: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current number of enrolled students
ClassroomSchema.virtual('enrollmentCount').get(function() {
  return this.students ? this.students.length : 0;
});

// Virtual to get all grades for this classroom
ClassroomSchema.virtual('grades', {
  ref: 'Grade',
  localField: '_id',
  foreignField: 'classroomId'
});

// Virtual to get all attendance records for this classroom
ClassroomSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'classroomId'
});

// Index for faster queries
ClassroomSchema.index({ teacherId: 1 });
ClassroomSchema.index({ subject: 1 });
ClassroomSchema.index({ gradeLevel: 1 });
ClassroomSchema.index({ year: 1, semester: 1 });
ClassroomSchema.index({ isActive: 1 });

// Check if classroom is at capacity before adding students
ClassroomSchema.methods.isAtCapacity = function() {
  if (!this.maxCapacity) return false;
  return this.students.length >= this.maxCapacity;
};

module.exports = mongoose.model('Classroom', ClassroomSchema);