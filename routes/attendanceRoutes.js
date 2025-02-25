const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Create a new attendance record
router.post('/', attendanceController.createAttendance);

// Get attendance record by ID
router.get('/:id', attendanceController.getAttendanceById);

// Get attendance records for a classroom
router.get('/classroom/:classroomId', attendanceController.getClassroomAttendance);

// Get attendance for a specific date and classroom
router.get('/classroom/:classroomId/date/:date', attendanceController.getAttendanceByDate);

// Get attendance records for a student
router.get('/student/:studentId', attendanceController.getStudentAttendance);

// Update an attendance record
router.put('/:id', attendanceController.updateAttendance);

// Update a specific student's attendance status
router.put('/:id/student/:studentId', attendanceController.updateStudentAttendance);

// Add a student to an attendance record
router.post('/:id/students/:studentId', attendanceController.addStudentToAttendance);

// Remove a student from an attendance record
router.delete('/:id/students/:studentId', attendanceController.removeStudentFromAttendance);

// Delete an attendance record
router.delete('/:id', attendanceController.deleteAttendance);

// Get attendance statistics for a classroom
router.get('/classroom/:classroomId/statistics', attendanceController.getClassroomAttendanceStatistics);

// Get attendance statistics for a student
router.get('/student/:studentId/statistics', attendanceController.getStudentAttendanceStatistics);

module.exports = router;
