// services/attendanceService.js
const Attendance = require('../models/Attendance');
const Classroom = require('../models/Classroom');
const mongoose = require('mongoose');

/**
 * Service layer for Attendance operations
 */
class AttendanceService {
  /**
   * Create a new attendance record for a classroom
   * @param {Object} attendanceData - The attendance data
   * @returns {Promise<Object>} Created attendance record
   */
  async createAttendance(attendanceData) {
    try {
      // Check if classroom exists
      const classroom = await Classroom.findById(attendanceData.classroomId);
      
      if (!classroom) {
        throw new Error('Classroom not found');
      }
      
      // Check if attendance record already exists for this date
      const existingAttendance = await Attendance.findOne({
        classroomId: attendanceData.classroomId,
        date: new Date(attendanceData.date).setHours(0, 0, 0, 0)
      });
      
      if (existingAttendance) {
        throw new Error('Attendance record already exists for this date');
      }
      
      // Create attendance record
      const attendance = await Attendance.create(attendanceData);
      return attendance;
    } catch (error) {
      throw new Error(`Error creating attendance record: ${error.message}`);
    }
  }

  /**
   * Get attendance record by ID
   * @param {string} id - Attendance ID
   * @returns {Promise<Object>} The attendance record
   */
  async getAttendanceById(id) {
    try {
      const attendance = await Attendance.findById(id)
        .populate('classroomId', 'name subject')
        .populate('takenBy', 'username')
        .populate('records.studentId', 'userId');
      
      if (!attendance) {
        throw new Error('Attendance record not found');
      }
      
      return attendance;
    } catch (error) {
      throw new Error(`Error retrieving attendance record: ${error.message}`);
    }
  }

  /**
   * Get attendance records for a classroom
   * @param {string} classroomId - Classroom ID
   * @param {Object} query - Filter query
   * @returns {Promise<Array>} Array of attendance records
   */
  async getClassroomAttendance(classroomId, query = {}) {
    try {
      // Build filter object based on query params
      const filterObj = { classroomId };
      
      if (query.startDate && query.endDate) {
        filterObj.date = {
          $gte: new Date(query.startDate).setHours(0, 0, 0, 0),
          $lte: new Date(query.endDate).setHours(23, 59, 59, 999)
        };
      } else if (query.startDate) {
        filterObj.date = { $gte: new Date(query.startDate).setHours(0, 0, 0, 0) };
      } else if (query.endDate) {
        filterObj.date = { $lte: new Date(query.endDate).setHours(23, 59, 59, 999) };
      }
      
      const attendance = await Attendance.find(filterObj)
        .populate('takenBy', 'username')
        .sort({ date: -1 });
      
      return attendance;
    } catch (error) {
      throw new Error(`Error retrieving classroom attendance: ${error.message}`);
    }
  }

  /**
   * Get attendance for a specific date and classroom
   * @param {string} classroomId - Classroom ID
   * @param {Date} date - Date to check
   * @returns {Promise<Object>} Attendance record
   */
  async getAttendanceByDate(classroomId, date) {
    try {
      const attendanceDate = new Date(date).setHours(0, 0, 0, 0);
      
      const attendance = await Attendance.findOne({
        classroomId,
        date: attendanceDate
      })
        .populate('records.studentId', 'userId')
        .populate('takenBy', 'username');
      
      return attendance;
    } catch (error) {
      throw new Error(`Error retrieving attendance by date: ${error.message}`);
    }
  }

  /**
   * Get attendance records for a student
   * @param {string} studentId - Student ID
   * @param {Object} query - Filter query
   * @returns {Promise<Array>} Array of attendance records
   */
  async getStudentAttendance(studentId, query = {}) {
    try {
      // Build filter object
      const filterObj = { 'records.studentId': studentId };
      
      if (query.classroomId) {
        filterObj.classroomId = query.classroomId;
      }
      
      if (query.startDate && query.endDate) {
        filterObj.date = {
          $gte: new Date(query.startDate).setHours(0, 0, 0, 0),
          $lte: new Date(query.endDate).setHours(23, 59, 59, 999)
        };
      } else if (query.startDate) {
        filterObj.date = { $gte: new Date(query.startDate).setHours(0, 0, 0, 0) };
      } else if (query.endDate) {
        filterObj.date = { $lte: new Date(query.endDate).setHours(23, 59, 59, 999) };
      }
      
      const attendanceRecords = await Attendance.find(filterObj)
        .populate('classroomId', 'name subject')
        .sort({ date: -1 });
      
      // Filter to only include this student's records
      const formattedRecords = attendanceRecords.map(record => {
        const studentRecord = record.records.find(
          r => r.studentId.toString() === studentId
        );
        
        return {
          _id: record._id,
          date: record.date,
          classroom: record.classroomId,
          status: studentRecord.status,
          remarks: studentRecord.remarks,
          minutesLate: studentRecord.minutesLate
        };
      });
      
      return formattedRecords;
    } catch (error) {
      throw new Error(`Error retrieving student attendance: ${error.message}`);
    }
  }

  /**
   * Update an attendance record
   * @param {string} id - Attendance ID
   * @param {Object} updateData - Updated attendance data
   * @returns {Promise<Object>} Updated attendance record
   */
  async updateAttendance(id, updateData) {
    try {
      const attendance = await Attendance.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });
      
      if (!attendance) {
        throw new Error('Attendance record not found');
      }
      
      return attendance;
    } catch (error) {
      throw new Error(`Error updating attendance record: ${error.message}`);
    }
  }

  /**
   * Update a specific student's attendance status
   * @param {string} id - Attendance ID
   * @param {string} studentId - Student ID
   * @param {Object} updateData - Updated student attendance data
   * @returns {Promise<Object>} Updated attendance record
   */
  async updateStudentAttendance(id, studentId, updateData) {
    try {
      const attendance = await Attendance.findById(id);
      
      if (!attendance) {
        throw new Error('Attendance record not found');
      }
      
      // Find the student record
      const studentRecordIndex = attendance.records.findIndex(
        record => record.studentId.toString() === studentId
      );
      
      if (studentRecordIndex === -1) {
        throw new Error('Student record not found in this attendance');
      }
      
      // Update the student record
      const updatePath = `records.${studentRecordIndex}`;
      const update = {};
      
      if (updateData.status) update[`${updatePath}.status`] = updateData.status;
      if (updateData.remarks !== undefined) update[`${updatePath}.remarks`] = updateData.remarks;
      if (updateData.minutesLate !== undefined) update[`${updatePath}.minutesLate`] = updateData.minutesLate;
      
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true, runValidators: true }
      );
      
      return updatedAttendance;
    } catch (error) {
      throw new Error(`Error updating student attendance: ${error.message}`);
    }
  }

  /**
   * Add a student to an attendance record
   * @param {string} id - Attendance ID
   * @param {string} studentId - Student ID
   * @param {Object} studentData - Student attendance data
   * @returns {Promise<Object>} Updated attendance record
   */
  async addStudentToAttendance(id, studentId, studentData) {
    try {
      const attendance = await Attendance.findById(id);
      
      if (!attendance) {
        throw new Error('Attendance record not found');
      }
      
      // Check if student already exists in the record
      const studentExists = attendance.records.some(
        record => record.studentId.toString() === studentId
      );
      
      if (studentExists) {
        throw new Error('Student already exists in this attendance record');
      }
      
      // Add student to attendance record
      const newRecord = {
        studentId,
        status: studentData.status || 'present',
        remarks: studentData.remarks || '',
        minutesLate: studentData.minutesLate || 0
      };
      
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        id,
        { $push: { records: newRecord } },
        { new: true, runValidators: true }
      );
      
      return updatedAttendance;
    } catch (error) {
      throw new Error(`Error adding student to attendance: ${error.message}`);
    }
  }

  /**
   * Remove a student from an attendance record
   * @param {string} id - Attendance ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Updated attendance record
   */
  async removeStudentFromAttendance(id, studentId) {
    try {
      const attendance = await Attendance.findById(id);
      
      if (!attendance) {
        throw new Error('Attendance record not found');
      }
      
      // Remove student from attendance record
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        id,
        { $pull: { records: { studentId } } },
        { new: true }
      );
      
      return updatedAttendance;
    } catch (error) {
      throw new Error(`Error removing student from attendance: ${error.message}`);
    }
  }

  /**
   * Delete an attendance record
   * @param {string} id - Attendance ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteAttendance(id) {
    try {
      const attendance = await Attendance.findByIdAndDelete(id);
      
      if (!attendance) {
        throw new Error('Attendance record not found');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Error deleting attendance record: ${error.message}`);
    }
  }

  /**
   * Get attendance statistics for a classroom
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Object>} Attendance statistics
   */
  async getClassroomAttendanceStatistics(classroomId) {
    try {
      const stats = await Attendance.getClassroomStatistics(classroomId);
      
      // Format the statistics
      const formattedStats = {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
      };
      
      stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
      });
      
      // Calculate percentages
      if (formattedStats.total > 0) {
        formattedStats.presentPercentage = ((formattedStats.present / formattedStats.total) * 100).toFixed(2);
        formattedStats.absentPercentage = ((formattedStats.absent / formattedStats.total) * 100).toFixed(2);
        formattedStats.latePercentage = ((formattedStats.late / formattedStats.total) * 100).toFixed(2);
        formattedStats.excusedPercentage = ((formattedStats.excused / formattedStats.total) * 100).toFixed(2);
      }
      
      return formattedStats;
    } catch (error) {
      throw new Error(`Error generating attendance statistics: ${error.message}`);
    }
  }

  /**
   * Get attendance statistics for a student
   * @param {string} studentId - Student ID
   * @param {string} classroomId - Optional classroom ID
   * @returns {Promise<Object>} Attendance statistics
   */
  async getStudentAttendanceStatistics(studentId, classroomId = null) {
    try {
      const stats = await Attendance.getStudentStatistics(studentId, classroomId);
      
      // Format the statistics
      const formattedStats = {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
      };
      
      stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
      });
      
      // Calculate percentages
      if (formattedStats.total > 0) {
        formattedStats.presentPercentage = ((formattedStats.present / formattedStats.total) * 100).toFixed(2);
        formattedStats.absentPercentage = ((formattedStats.absent / formattedStats.total) * 100).toFixed(2);
        formattedStats.latePercentage = ((formattedStats.late / formattedStats.total) * 100).toFixed(2);
        formattedStats.excusedPercentage = ((formattedStats.excused / formattedStats.total) * 100).toFixed(2);
      }
      
      return formattedStats;
    } catch (error) {
      throw new Error(`Error generating student attendance statistics: ${error.message}`);
    }
  }
}

module.exports = new AttendanceService();