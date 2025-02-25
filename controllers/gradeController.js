const express = require('express');
const router = express.Router();
const gradeService = require('../services/gradeService');

/**
 * Controller for Grade operations
 */

// Create a new grade
router.post('/grades', async (req, res) => {
  try {
    const grade = await gradeService.createGrade(req.body);
    res.status(201).json(grade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a grade by ID
router.get('/grades/:id', async (req, res) => {
  try {
    const grade = await gradeService.getGradeById(req.params.id);
    res.status(200).json(grade);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get all grades for a student
router.get('/grades/student/:studentId', async (req, res) => {
  try {
    const grades = await gradeService.getGradesByStudent(req.params.studentId);
    res.status(200).json(grades);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all grades for a classroom
router.get('/grades/classroom/:classroomId', async (req, res) => {
  try {
    const grades = await gradeService.getGradesByClassroom(req.params.classroomId);
    res.status(200).json(grades);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get student's grades for a specific classroom
router.get('/grades/student/:studentId/classroom/:classroomId', async (req, res) => {
  try {
    const grades = await gradeService.getStudentClassroomGrades(req.params.studentId, req.params.classroomId);
    res.status(200).json(grades);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Calculate student's average grade for a classroom
router.get('/grades/student/:studentId/classroom/:classroomId/average', async (req, res) => {
  try {
    const average = await gradeService.getStudentAverage(req.params.studentId, req.params.classroomId);
    res.status(200).json({ average });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a grade
router.put('/grades/:id', async (req, res) => {
  try {
    const grade = await gradeService.updateGrade(req.params.id, req.body);
    res.status(200).json(grade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a grade
router.delete('/grades/:id', async (req, res) => {
  try {
    const result = await gradeService.deleteGrade(req.params.id);
    res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get grade statistics for a classroom
router.get('/grades/classroom/:classroomId/statistics', async (req, res) => {
  try {
    const stats = await gradeService.getClassroomGradeStatistics(req.params.classroomId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
