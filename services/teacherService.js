const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Teacher Service - Handles all business logic related to teachers
 */
class TeacherService {
  /**
   * Create a new teacher profile
   * @param {Object} teacherData - Teacher data
   * @returns {Object} Newly created teacher profile
   */
  async createTeacher(teacherData) {
    // Check if user exists
    const user = await User.findById(teacherData.userId);
    
    if (!user) {
      throw new ErrorResponse(`No user found with id ${teacherData.userId}`, 404);
    }
    
    // Check if user is already a teacher
    const existingTeacher = await Teacher.findOne({ userId: teacherData.userId });
    
    if (existingTeacher) {
      throw new ErrorResponse(`User already has a teacher profile`, 400);
    }
    
    // Update user role to teacher if not already
    if (user.role !== 'teacher') {
      user.role = 'teacher';
      await user.save();
    }
    
    // Create teacher profile
    const teacher = await Teacher.create(teacherData);
    
    return teacher;
  }

  /**
   * Get teacher by ID
   * @param {String} teacherId - Teacher ID
   * @returns {Object} Teacher profile
   */
  async getTeacherById(teacherId) {
    const teacher = await Teacher.findById(teacherId).populate('userId', 'username email firstName lastName');
    
    if (!teacher) {
      throw new ErrorResponse(`No teacher found with id ${teacherId}`, 404);
    }
    
    return teacher;
  }

  /**
   * Get teacher by user ID
   * @param {String} userId - User ID
   * @returns {Object} Teacher profile
   */
  async getTeacherByUserId(userId) {
    const teacher = await Teacher.findOne({ userId }).populate('userId', 'username email firstName lastName');
    
    if (!teacher) {
      throw new ErrorResponse(`No teacher profile found for user with id ${userId}`, 404);
    }
    
    return teacher;
  }

  /**
   * Update teacher profile
   * @param {String} teacherId - Teacher ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated teacher profile
   */
  async updateTeacher(teacherId, updateData) {
    const teacher = await Teacher.findByIdAndUpdate(teacherId, updateData, {
      new: true,
      runValidators: true
    }).populate('userId', 'username email firstName lastName');
    
    if (!teacher) {
      throw new ErrorResponse(`No teacher found with id ${teacherId}`, 404);
    }
    
    return teacher;
  }

  /**
   * Get all classrooms for a teacher
   * @param {String} teacherId - Teacher ID
   * @returns {Array} List of classrooms
   */
  async getTeacherClassrooms(teacherId) {
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      throw new ErrorResponse(`No teacher found with id ${teacherId}`, 404);
    }
    
    const classrooms = await Classroom.find({ teacherId })
      .populate('students', 'studentId')
      .sort({ year: -1, semester: 1 });
    
    return classrooms;
  }

  /**
   * Get all teachers (with pagination and filtering)
   * @param {Object} query - Query parameters
   * @returns {Array} List of teachers
   */
  async getAllTeachers(query) {
    // Build query
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Add department filtering if specified
    if (query.department) {
      filter.department = query.department;
    }
    
    // Add subject filtering if specified
    if (query.subject) {
      filter.subjects = query.subject;
    }
    
    // Add employment status filtering
    if (query.employmentStatus) {
      filter.employmentStatus = query.employmentStatus;
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
        { teacherId: { $regex: query.search, $options: 'i' } }
      ];
    }

    const teachers = await Teacher.find(filter)
      .populate('userId', 'username email firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ hireDate: -1 });

    const total = await Teacher.countDocuments(filter);

    return {
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Add subject to teacher
   * @param {String} teacherId - Teacher ID
   * @param {String} subject - Subject name
   * @returns {Object} Updated teacher profile
   */
  async addSubject(teacherId, subject) {
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      throw new ErrorResponse(`No teacher found with id ${teacherId}`, 404);
    }
    
    // Check if subject already exists
    if (teacher.subjects.includes(subject)) {
      throw new ErrorResponse(`Teacher already has subject ${subject}`, 400);
    }
    
    teacher.subjects.push(subject);
    await teacher.save();
    
    return teacher;
  }

  /**
   * Remove subject from teacher
   * @param {String} teacherId - Teacher ID
   * @param {String} subject - Subject name
   * @returns {Object} Updated teacher profile
   */
  async removeSubject(teacherId, subject) {
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      throw new ErrorResponse(`No teacher found with id ${teacherId}`, 404);
    }
    
    // Check if subject exists
    if (!teacher.subjects.includes(subject)) {
      throw new ErrorResponse(`Teacher does not have subject ${subject}`, 400);
    }
    
    teacher.subjects = teacher.subjects.filter(s => s !== subject);
    await teacher.save();
    
    return teacher;
  }

  /**
   * Delete teacher profile
   * @param {String} teacherId - Teacher ID
   * @returns {Boolean} Success status
   */
  async deleteTeacher(teacherId) {
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      throw new ErrorResponse(`No teacher found with id ${teacherId}`, 404);
    }
    
    // Check if teacher has classrooms
    const classroomCount = await Classroom.countDocuments({ teacherId });
    
    if (classroomCount > 0) {
      throw new ErrorResponse(
        `Cannot delete teacher with ${classroomCount} active classrooms. Reassign classrooms first.`,
        400
      );
    }
    
    // Reset user role if deleting teacher profile
    const user = await User.findById(teacher.userId);
    if (user) {
      user.role = 'student';
      await user.save();
    }
    
    await teacher.remove();
    
    return true;
  }
}

module.exports = new TeacherService();