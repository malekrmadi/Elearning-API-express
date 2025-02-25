const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

// Create a new grade
router.post('/grades', gradeController.createGrade);

// Get a grade by ID
router.get('/grades/:id', gradeController.getGradeById);

// Get all grades for a student
router.get('/grades/student/:studentId', gradeController.getGradesByStudent);

// Get all grades for a classroom
router.get('/grades/classroom/:classroomId', gradeController.getGradesByClassroom);

// Get student's grades for a specific classroom
router.get('/grades/student/:studentId/classroom/:classroomId', gradeController.getStudentClassroomGrades);

// Calculate student's average grade for a classroom
router.get('/grades/student/:studentId/classroom/:classroomId/average', gradeController.getStudentAverage);

// Update a grade
router.put('/grades/:id', gradeController.updateGrade);

// Delete a grade
router.delete('/grades/:id', gradeController.deleteGrade);

// Get grade statistics for a classroom
router.get('/grades/classroom/:classroomId/statistics', gradeController.getClassroomGradeStatistics);

module.exports = router;
