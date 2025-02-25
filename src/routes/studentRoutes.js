const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Create a new student
router.post('/', studentController.createStudent);

// Get a student by ID
router.get('/:id', studentController.getStudentById);

// Get a student by user ID
router.get('/user/:userId', studentController.getStudentByUserId);

// Update a student's profile
router.put('/:id', studentController.updateStudent);

// Get all classrooms for a student
router.get('/:id/classrooms', studentController.getStudentClassrooms);

// Enroll a student in a classroom
router.post('/:id/enroll/:classroomId', studentController.enrollInClassroom);

// Withdraw a student from a classroom
router.delete('/:id/withdraw/:classroomId', studentController.withdrawFromClassroom);

// Get student grades (optionally filter by classroom)
router.get('/:id/grades', studentController.getStudentGrades);

// Get student attendance (optionally filter by classroom)
router.get('/:id/attendance', studentController.getStudentAttendance);

// Get all students (with pagination & filtering)
router.get('/', studentController.getAllStudents);

// Delete a student profile
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
