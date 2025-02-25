// controllers/attendanceController.js
const AttendanceService = require('../services/attendanceService');

/**
 * Controller for Attendance operations
 */
class AttendanceController {
  /**
   * Create a new attendance record
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async createAttendance(req, res) {
    try {
      const attendanceData = req.body;
      const attendance = await AttendanceService.createAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get attendance record by ID
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async getAttendanceById(req, res) {
    try {
      const { id } = req.params;
      const attendance = await AttendanceService.getAttendanceById(id);
      res.status(200).json(attendance);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Get attendance records for a classroom
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async getClassroomAttendance(req, res) {
    try {
      const { classroomId } = req.params;
      const { query } = req;
      const attendance = await AttendanceService.getClassroomAttendance(classroomId, query);
      res.status(200).json(attendance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get attendance for a specific date and classroom
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async getAttendanceByDate(req, res) {
    try {
      const { classroomId, date } = req.params;
      const attendance = await AttendanceService.getAttendanceByDate(classroomId, date);
      res.status(200).json(attendance);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Get attendance records for a student
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async getStudentAttendance(req, res) {
    try {
      const { studentId } = req.params;
      const { query } = req;
      const attendance = await AttendanceService.getStudentAttendance(studentId, query);
      res.status(200).json(attendance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update an attendance record
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async updateAttendance(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const attendance = await AttendanceService.updateAttendance(id, updateData);
      res.status(200).json(attendance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update a specific student's attendance status
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async updateStudentAttendance(req, res) {
    try {
      const { id, studentId } = req.params;
      const updateData = req.body;
      const updatedAttendance = await AttendanceService.updateStudentAttendance(id, studentId, updateData);
      res.status(200).json(updatedAttendance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Add a student to an attendance record
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async addStudentToAttendance(req, res) {
    try {
      const { id, studentId } = req.params;
      const studentData = req.body;
      const updatedAttendance = await AttendanceService.addStudentToAttendance(id, studentId, studentData);
      res.status(200).json(updatedAttendance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove a student from an attendance record
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async removeStudentFromAttendance(req, res) {
    try {
      const { id, studentId } = req.params;
      const updatedAttendance = await AttendanceService.removeStudentFromAttendance(id, studentId);
      res.status(200).json(updatedAttendance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete an attendance record
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async deleteAttendance(req, res) {
    try {
      const { id } = req.params;
      const success = await AttendanceService.deleteAttendance(id);
      if (success) {
        res.status(200).json({ message: 'Attendance record deleted successfully' });
      } else {
        res.status(404).json({ error: 'Attendance record not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get attendance statistics for a classroom
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async getClassroomAttendanceStatistics(req, res) {
    try {
      const { classroomId } = req.params;
      const stats = await AttendanceService.getClassroomAttendanceStatistics(classroomId);
      res.status(200).json(stats);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get attendance statistics for a student
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async getStudentAttendanceStatistics(req, res) {
    try {
      const { studentId } = req.params;
      const { classroomId } = req.query;
      const stats = await AttendanceService.getStudentAttendanceStatistics(studentId, classroomId);
      res.status(200).json(stats);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AttendanceController();
