const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');

// Create a new classroom
router.post('/', classroomController.createClassroom);

// Get a classroom by ID
router.get('/:id', classroomController.getClassroomById);

// Get all classrooms
router.get('/', classroomController.getAllClassrooms);

// Get classrooms by teacher ID
router.get('/teacher/:teacherId', classroomController.getTeacherClassrooms);

// Get classrooms by student ID
router.get('/student/:studentId', classroomController.getStudentClassrooms);

// Update a classroom
router.put('/:id', classroomController.updateClassroom);

// Delete a classroom
router.delete('/:id', classroomController.deleteClassroom);

// Add a student to a classroom
router.post('/:classroomId/students/:studentId', classroomController.addStudentToClassroom);

// Remove a student from a classroom
router.delete('/:classroomId/students/:studentId', classroomController.removeStudentFromClassroom);

module.exports = router;
