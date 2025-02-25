const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Create a new teacher
router.post('/', teacherController.createTeacher);

// Get a teacher by ID
router.get('/:id', teacherController.getTeacherById);

// Get a teacher by user ID
router.get('/user/:userId', teacherController.getTeacherByUserId);

// Update a teacher's profile
router.put('/:id', teacherController.updateTeacher);

// Get all classrooms for a teacher
router.get('/:id/classrooms', teacherController.getTeacherClassrooms);

// Get all teachers (with pagination & filtering)
router.get('/', teacherController.getAllTeachers);

// Add a subject to a teacher
router.put('/:id/add-subject', teacherController.addSubject);

// Remove a subject from a teacher
router.put('/:id/remove-subject', teacherController.removeSubject);

// Delete a teacher profile
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
