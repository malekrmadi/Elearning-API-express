const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subjects: [{
    type: String,
    required: [true, 'Please provide at least one subject']
  }],
  qualifications: [{
    type: String
  }],
  hireDate: {
    type: Date,
    default: Date.now
  },
  teacherId: {
    type: String,
    required: [true, 'Please provide a teacher ID'],
    unique: true,
    trim: true
  },
  classrooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  department: {
    type: String
  },
  officeLocation: {
    type: String
  },
  officeHours: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  bio: {
    type: String
  },
  employmentStatus: {
    type: String,
    enum: ['full-time', 'part-time', 'substitute', 'contract'],
    default: 'full-time'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to get all classrooms for this teacher
TeacherSchema.virtual('teachingClassrooms', {
  ref: 'Classroom',
  localField: '_id',
  foreignField: 'teacherId'
});

// Index for faster queries
TeacherSchema.index({ userId: 1 });
TeacherSchema.index({ teacherId: 1 });
TeacherSchema.index({ subjects: 1 });

module.exports = mongoose.model('Teacher', TeacherSchema);