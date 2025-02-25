// controllers/classroomController.js
const express = require('express');
const ClassroomService = require('../services/classroomService');
const router = express.Router();

// Create a new classroom
router.post('/', async (req, res) => {
  try {
    const classroom = await ClassroomService.createClassroom(req.body);
    res.status(201).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a classroom by ID
router.get('/:id', async (req, res) => {
  try {
    const classroom = await ClassroomService.getClassroomById(req.params.id);
    res.status(200).json(classroom);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get all classrooms
router.get('/', async (req, res) => {
  try {
    const classrooms = await ClassroomService.getAllClassrooms(req.query);
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get classrooms by teacher ID
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const classrooms = await ClassroomService.getTeacherClassrooms(req.params.teacherId);
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get classrooms by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const classrooms = await ClassroomService.getStudentClassrooms(req.params.studentId);
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a classroom
router.put('/:id', async (req, res) => {
  try {
    const classroom = await ClassroomService.updateClassroom(req.params.id, req.body);
    res.status(200).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a classroom
router.delete('/:id', async (req, res) => {
  try {
    await ClassroomService.deleteClassroom(req.params.id);
    res.status(200).json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a student to a classroom
router.post('/:classroomId/students/:studentId', async (req, res) => {
  try {
    const classroom = await ClassroomService.addStudentToClassroom(
      req.params.classroomId,
      req.params.studentId
    );
    res.status(200).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove a student from a classroom
router.delete('/:classroomId/students/:studentId', async (req, res) => {
  try {
    const classroom = await ClassroomService.removeStudentFromClassroom(
      req.params.classroomId,
      req.params.studentId
    );
    res.status(200).json(classroom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
