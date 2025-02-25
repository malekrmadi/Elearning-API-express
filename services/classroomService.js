// services/classroomService.js
const Classroom = require('../models/Classroom');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const mongoose = require('mongoose');

/**
 * Service layer for Classroom operations
 */
class ClassroomService {
  /**
   * Create a new classroom
   * @param {Object} classroomData - The classroom data
   * @returns {Promise<Object>} Created classroom
   */
  async createClassroom(classroomData) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      
      // Create the classroom
      const classroom = await Classroom.create([classroomData], { session });
      
      // Update teacher's classrooms array
      await Teacher.findByIdAndUpdate(
        classroomData.teacherId,
        { $push: { classrooms: classroom[0]._id } },
        { session }
      );
      
      await session.commitTransaction();
      return classroom[0];
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error creating classroom: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Get a classroom by ID
   * @param {string} id - Classroom ID
   * @returns {Promise<Object>} The classroom
   */
  async getClassroomById(id) {
    try {
      const classroom = await Classroom.findById(id)
        .populate('teacherId', 'userId subjects')
        .populate('students', 'userId studentId grade');
      
      if (!classroom) {
        throw new Error('Classroom not found');
      }
      
      return classroom;
    } catch (error) {
      throw new Error(`Error retrieving classroom: ${error.message}`);
    }
  }

  /**
   * Get all classrooms
   * @param {Object} query - Filter query
   * @returns {Promise<Array>} Array of classrooms
   */
  async getAllClassrooms(query = {}) {
    try {
      // Build filter object based on query params
      const filterObj = {};
      
      if (query.subject) filterObj.subject = query.subject;
      if (query.gradeLevel) filterObj.gradeLevel = query.gradeLevel;
      if (query.semester) filterObj.semester = query.semester;
      if (query.year) filterObj.year = parseInt(query.year);
      if (query.isActive) filterObj.isActive = query.isActive === 'true';
      
      const classrooms = await Classroom.find(filterObj)
        .populate('teacherId', 'userId subjects')
        .sort({ createdAt: -1 });
      
      return classrooms;
    } catch (error) {
      throw new Error(`Error retrieving classrooms: ${error.message}`);
    }
  }

  /**
   * Get all classrooms for a teacher
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<Array>} Array of classrooms
   */
  async getTeacherClassrooms(teacherId) {
    try {
      const classrooms = await Classroom.find({ teacherId })
        .populate('students', 'userId studentId grade')
        .sort({ year: -1, semester: 1 });
      
      return classrooms;
    } catch (error) {
      throw new Error(`Error retrieving teacher classrooms: ${error.message}`);
    }
  }

  /**
   * Get all classrooms for a student
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} Array of classrooms
   */
  async getStudentClassrooms(studentId) {
    try {
      const student = await Student.findById(studentId);
      
      if (!student) {
        throw new Error('Student not found');
      }
      
      const classrooms = await Classroom.find({ _id: { $in: student.classrooms } })
        .populate('teacherId', 'userId subjects')
        .sort({ year: -1, semester: 1 });
      
      return classrooms;
    } catch (error) {
      throw new Error(`Error retrieving student classrooms: ${error.message}`);
    }
  }

  /**
   * Update a classroom
   * @param {string} id - Classroom ID
   * @param {Object} updateData - Updated classroom data
   * @returns {Promise<Object>} Updated classroom
   */
  async updateClassroom(id, updateData) {
    try {
      const classroom = await Classroom.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });
      
      if (!classroom) {
        throw new Error('Classroom not found');
      }
      
      return classroom;
    } catch (error) {
      throw new Error(`Error updating classroom: ${error.message}`);
    }
  }

  /**
   * Delete a classroom
   * @param {string} id - Classroom ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteClassroom(id) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      
      // Get the classroom
      const classroom = await Classroom.findById(id);
      
      if (!classroom) {
        throw new Error('Classroom not found');
      }
      
      // Remove classroom from teacher's classrooms array
      await Teacher.findByIdAndUpdate(
        classroom.teacherId,
        { $pull: { classrooms: classroom._id } },
        { session }
      );
      
      // Remove classroom from students' classrooms arrays
      await Student.updateMany(
        { _id: { $in: classroom.students } },
        { $pull: { classrooms: classroom._id } },
        { session }
      );
      
      // Delete the classroom
      await Classroom.findByIdAndDelete(id, { session });
      
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error deleting classroom: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Add a student to a classroom
   * @param {string} classroomId - Classroom ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Updated classroom
   */
  async addStudentToClassroom(classroomId, studentId) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      
      // Get classroom and check capacity
      const classroom = await Classroom.findById(classroomId);
      
      if (!classroom) {
        throw new Error('Classroom not found');
      }
      
      if (classroom.isAtCapacity()) {
        throw new Error('Classroom is at maximum capacity');
      }
      
      // Check if student exists
      const student = await Student.findById(studentId);
      
      if (!student) {
        throw new Error('Student not found');
      }
      
      // Check if student is already in classroom
      if (classroom.students.includes(studentId)) {
        throw new Error('Student is already enrolled in this classroom');
      }
      
      // Add student to classroom
      await Classroom.findByIdAndUpdate(
        classroomId,
        { $push: { students: studentId } },
        { session }
      );
      
      // Add classroom to student
      await Student.findByIdAndUpdate(
        studentId,
        { $push: { classrooms: classroomId } },
        { session }
      );
      
      await session.commitTransaction();
      
      // Return updated classroom
      return await Classroom.findById(classroomId)
        .populate('students', 'userId studentId grade');
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error adding student to classroom: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Remove a student from a classroom
   * @param {string} classroomId - Classroom ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Updated classroom
   */
  async removeStudentFromClassroom(classroomId, studentId) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      
      // Check if classroom exists
      const classroom = await Classroom.findById(classroomId);
      
      if (!classroom) {
        throw new Error('Classroom not found');
      }
      
      // Check if student exists
      const student = await Student.findById(studentId);
      
      if (!student) {
        throw new Error('Student not found');
      }
      
      // Remove student from classroom
      await Classroom.findByIdAndUpdate(
        classroomId,
        { $pull: { students: studentId } },
        { session }
      );
      
      // Remove classroom from student
      await Student.findByIdAndUpdate(
        studentId,
        { $pull: { classrooms: classroomId } },
        { session }
      );
      
      await session.commitTransaction();
      
      // Return updated classroom
      return await Classroom.findById(classroomId)
        .populate('students', 'userId studentId grade');
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error removing student from classroom: ${error.message}`);
    } finally {
      session.endSession();
    }
  }
}

module.exports = new ClassroomService();