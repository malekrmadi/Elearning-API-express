const Student = require('../models/Student');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Student Service - Handles all business logic related to students
 */
class StudentService {
  /**
   * Create a new student profile
   * @param {Object} studentData - Student data
   * @returns {Object} Newly created student profile
   */
  async createStudent(studentData) {
    // Check if user exists
    const user = await User.findById(studentData.userId);
    
    if (!user) {
      throw new ErrorResponse(`No user found with id ${studentData.userId}`, 404);
    }
    
    // Check if user is already a student
    const existingStudent = await Student.findOne({ userId: studentData.userId });
    
    if (existingStudent) {
      throw new ErrorResponse(`User already has a student profile`, 400);
    }
    
    // Update user role to student if not already
    if (user.role !== 'student') {
      user.role = 'student';
      await user.save();
    }
    
    // Create student profile
    const student = await Student.create(studentData);
    
    return student;
  }

  /**
   * Get student by ID
   * @param {String} studentId - Student ID
   * @returns {Object} Student profile
   */
  async getStudentById(studentId) {
    const student = await Student.findById(studentId).populate('userId', 'username email firstName lastName');
    
    if (!student) {
      throw new ErrorResponse(`No student found with id ${studentId}`, 404);
    }
    
    return student;
  }

  /**
   * Get student by user ID
   * @param {String} userId - User ID
   * @returns {Object} Student profile
   */
  async getStudentByUserId(userId) {
    const student = await Student.findOne({ userId }).populate('userId', 'username email firstName lastName');
    
    if (!student) {
      throw new ErrorResponse(`No student profile found for user with id ${userId}`, 404);
    }
    
    return student;
  }

  /**
   * Update student profile
   * @param {String} studentId - Student ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated student profile
   */
  async updateStudent(studentId, updateData) {
    const student = await Student.findByIdAndUpdate(studentId, updateData, {
      new: true,
      runValidators: true
    }).populate('userId', 'username email firstName lastName');
    
    if (!student) {
      throw new ErrorResponse(`No student found with id ${studentId}`, 404);
    }
    
    return student;
  }

  /**
   * Get all classrooms for a student
   * @param {String} studentId - Student ID
   * @returns {Array} List of classrooms
   */
  async getStudentClassrooms(studentId) {
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new ErrorResponse(`No student found with id ${studentId}`, 404);
    }
    
    // Get classrooms containing this student
    const classrooms = await Classroom.find({ students: studentId })
      .populate('teacherId', 'teacherId')
      .sort({ year: -1, semester: 1 });
    
    return classrooms;
  }

  /**
   * Enroll student in a classroom
   * @param {String} studentId - Student ID
   * @param {String} classroomId - Classroom ID
   * @returns {Object} Updated student and classroom
   */
  async enrollInClassroom(studentId, classroomId) {
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new ErrorResponse(`No student found with id ${studentId}`, 404);
    }
    
    const classroom = await Classroom.findById(classroomId);
    
    if (!classroom) {
      throw new ErrorResponse(`No classroom found with id ${classroomId}`, 404);
    }
    
    // Check if student is already enrolled
    if (classroom.students.includes(studentId)) {
      throw new ErrorResponse(`Student is already enrolled in this classroom`, 400);
    }
    
    // Check if classroom is at capacity
    if (classroom.isAtCapacity()) {
      throw new ErrorResponse(`Classroom is at maximum capacity`, 400);
    }
    
    // Add student to classroom and classroom to student
    classroom.students.push(studentId);
    student.classrooms.push(classroomId);
    
    await Promise.all([classroom.save(), student.save()]);
    
    return { student, classroom };
  }

  /**
   * Withdraw student from a classroom
   * @param {String} studentId - Student ID
   * @param {String} classroomId - Classroom ID
   * @returns {Object} Updated student and classroom
   */
  async withdrawFromClassroom(studentId, classroomId) {
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new ErrorResponse(`No student found with id ${studentId}`, 404);
    }
    
    const classroom = await Classroom.findById(classroomId);
    
    if (!classroom) {
      throw new ErrorResponse(`No classroom found with id ${classroomId}`, 404);
    }
    
    // Check if student is enrolled
    if (!classroom.students.includes(studentId)) {
      throw new ErrorResponse(`Student is not enrolled in this classroom`, 400);
    }
    
    // Remove student from classroom and classroom from student
    classroom.students = classroom.students.filter(id => id.toString() !== studentId.toString());
    student.classrooms = student.classrooms.filter(id => id.toString() !== classroomId.toString());
    
    await Promise.all([classroom.save(), student.save()]);
    
    return { student, classroom };
  }

  /**
   * Get all grades for a student
   * @param {String} studentId - Student ID
   * @param {String} classroomId - Optional classroom ID to filter by
   * @returns {Array} List of grades
   */
  async getStudentGrades(studentId, classroomId) {
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new ErrorResponse(`No student found with id ${studentId}`, 404);
    }
    
    // Build query
    const query = { studentId };
    
    if (classroomId) {
      query.classroomId = classroomId;
    }
    
    const grades = await Grade.find(query)
      .populate('classroomId', 'name subject')
      .sort({ submissionDate: -1 });
    
    // Calculate GPA if classroom is specified
    let gpa = null;
    
    if (classroomId && grades.length > 0) {
      const totalWeightedScore = grades.reduce((sum, grade) => {
        return sum + (grade.score / grade.maxScore) * grade.weightage;
      }, 0);
      
      const totalWeight = grades.reduce((sum, grade) => sum + grade.weightage, 0);
      
      gpa = totalWeightedScore / totalWeight * 4.0;
    }
    
    return {
      grades,
      gpa: gpa ? gpa.toFixed(2) : null
    };
  }

  /**
   * Get attendance records for a student
   * @param {String} studentId - Student ID
   * @param {String} classroomId - Optional classroom ID to filter by
   * @returns {Array} List of attendance records
   */
  async getStudentAttendance(studentId, classroomId) {
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new ErrorResponse(`No student found with id ${studentId}`, 404);
    }
    
    // Build pipeline for aggregation
    const pipeline = [
      {
        $match: {
          'records.studentId': studentId
        }
      },
      { $unwind: '$records' },
      {
        $match: {
          'records.studentId': studentId
        }
      },
      {
        $project: {
          classroomId: 1,
          date: 1,
          status: '$records.status',
          remarks: '$records.remarks',
          minutesLate: '$records.minutesLate'
        }
      },
      {
        $sort: { date: -1 }
      }
    ];
    
    // Add classroom filter if provided
    if (classroomId) {
      pipeline[0].$match.classroomId = classroomId;
    }
    
    // Add classroom lookup
    pipeline.push({
      $lookup: {
        from: 'classrooms',
        localField: 'classroomId',
        foreignField: '_id',
        as: 'classroom'
      }
    });
    
    pipeline.push({
      $project: {
        date: 1,
        status: 1,
        remarks: 1,
        minutesLate: 1,
        classroom: { $arrayElemAt: ['$classroom.name', 0] }
      }
    });
    
    const attendanceRecords = await Attendance.aggregate(pipeline);
    
    // Get statistics
    const stats = await Attendance.getStudentStatistics(studentId, classroomId);
    
    return {
      records: attendanceRecords,
      statistics: stats
    };
  }

  /**
   * Get all students (with pagination and filtering)
   * @param {Object} query - Query parameters
   * @returns {Array} List of students
   */
  async getAllStudents(query) {
    // Build query
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add grade filtering if specified
    if (query.grade) {
      filter.grade = query.grade;
    }
    
    // Add search functionality
    if (query.search) {
      // Get matching user IDs first (for name search)
      const users = await User.find({
        $or: [
          { firstName: { $regex: query.search, $options: 'i' } },
          { lastName: { $regex: query.search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      filter.$or = [
        { userId: { $in: userIds } },
        { studentId: { $regex: query.search, $options: 'i' } },
        { 'parentContact.name': { $regex: query.search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter)
      .populate('userId', 'username email firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ enrollmentDate: -1 });

    const total = await Student.countDocuments(filter);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Delete student profile
   * @param {String} studentId - Student ID
   * @returns {Boolean} Success status
   */
  async deleteStudent(studentId) {
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new ErrorResponse(`No student found with id ${studentId}`, 404);
    }
    
    // Check if student is enrolled in any classrooms
    if (student.classrooms.length > 0) {
      throw new ErrorResponse(
        `Cannot delete student enrolled in ${student.classrooms.length} classrooms. Withdraw student first.`,
        400
      );
    }
    
    // Delete associated grades
    await Grade.deleteMany({ studentId });
    
    // Clean up attendance records (more complex)
    const attendanceRecords = await Attendance.find({ 'records.studentId': studentId });
    
    for (const attendance of attendanceRecords) {
      attendance.records = attendance.records.filter(
        record => record.studentId.toString() !== studentId.toString()
      );
      
      if (attendance.records.length === 0) {
        await attendance.remove();
      } else {
        await attendance.save();
      }
    }
    
    await student.remove();
    
    return true;
  }
}

module.exports = new StudentService();