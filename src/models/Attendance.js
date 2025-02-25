const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide a student ID']
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: [true, 'Please specify the attendance status']
  },
  remarks: {
    type: String
  },
  minutesLate: {
    type: Number,
    default: 0
  }
});

const AttendanceSchema = new mongoose.Schema({
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: [true, 'Please provide a classroom ID']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date']
  },
  records: [AttendanceRecordSchema],
  takenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionTopic: {
    type: String
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create a compound index to ensure one attendance record per classroom per day
AttendanceSchema.index({ classroomId: 1, date: 1 }, { unique: true });

// Additional indexes for faster queries
AttendanceSchema.index({ 'records.studentId': 1 });
AttendanceSchema.index({ date: 1 });

// Static method to get attendance statistics for a classroom
AttendanceSchema.statics.getClassroomStatistics = async function(classroomId) {
  const stats = await this.aggregate([
    { $match: { classroomId: mongoose.Types.ObjectId(classroomId) } },
    { $unwind: '$records' },
    { 
      $group: {
        _id: '$records.status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats;
};

// Static method to get attendance statistics for a student
AttendanceSchema.statics.getStudentStatistics = async function(studentId, classroomId) {
  const match = { 'records.studentId': mongoose.Types.ObjectId(studentId) };
  
  if (classroomId) {
    match.classroomId = mongoose.Types.ObjectId(classroomId);
  }
  
  const stats = await this.aggregate([
    { $match: match },
    { $unwind: '$records' },
    { 
      $match: { 'records.studentId': mongoose.Types.ObjectId(studentId) }
    },
    { 
      $group: {
        _id: '$records.status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('Attendance', AttendanceSchema);