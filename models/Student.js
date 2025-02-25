const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  grade: {
    type: String,
    required: [true, 'Please provide the student\'s grade level']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  studentId: {
    type: String,
    required: [true, 'Please provide a student ID'],
    unique: true,
    trim: true
  },
  classrooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  parentContact: {
    name: {
      type: String,
      required: [true, 'Please provide parent\'s name']
    },
    email: {
      type: String,
      required: [true, 'Please provide parent\'s email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide parent\'s phone number']
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  dateOfBirth: {
    type: Date
  },
  specialNeeds: {
    type: String
  },
  medicalInfo: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for student's full name
StudentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to get all grades for this student
StudentSchema.virtual('grades', {
  ref: 'Grade',
  localField: '_id',
  foreignField: 'studentId'
});

// Virtual to get all attendance records for this student
StudentSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'records.studentId'
});

// Index for faster queries
StudentSchema.index({ userId: 1 });
StudentSchema.index({ studentId: 1 });

module.exports = mongoose.model('Student', StudentSchema);