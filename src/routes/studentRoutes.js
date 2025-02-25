const express = require('express');
const StudentService = require('./services/StudentService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// Create a new student
router.post('/', asyncHandler(async (req, res, next) => {
    const student = await StudentService.createStudent(req.body);
    res.status(201).json({ success: true, data: student });
}));

// Get student by ID
router.get('/:id', asyncHandler(async (req, res, next) => {
    const student = await StudentService.getStudentById(req.params.id);
    res.status(200).json({ success: true, data: student });
}));

// Get student by user ID
router.get('/user/:userId', asyncHandler(async (req, res, next) => {
    const student = await StudentService.getStudentByUserId(req.params.userId);
    res.status(200).json({ success: true, data: student });
}));

// Update student profile
router.put('/:id', asyncHandler(async (req, res, next) => {
    const student = await StudentService.updateStudent(req.params.id, req.body);
    res.status(200).json({ success: true, data: student });
}));

// Get all classrooms for a student
router.get('/:id/classrooms', asyncHandler(async (req, res, next) => {
    const classrooms = await StudentService.getStudentClassrooms(req.params.id);
    res.status(200).json({ success: true, data: classrooms });
}));

// Enroll student in a classroom
router.post('/:id/enroll/:classroomId', asyncHandler(async (req, res, next) => {
    const result = await StudentService.enrollInClassroom(req.params.id, req.params.classroomId);
    res.status(200).json({ success: true, data: result });
}));

// Withdraw student from a classroom
router.delete('/:id/withdraw/:classroomId', asyncHandler(async (req, res, next) => {
    const result = await StudentService.withdrawFromClassroom(req.params.id, req.params.classroomId);
    res.status(200).json({ success: true, data: result });
}));

// Get student grades (optionally filter by classroom)
router.get('/:id/grades', asyncHandler(async (req, res, next) => {
    const grades = await StudentService.getStudentGrades(req.params.id, req.query.classroomId);
    res.status(200).json({ success: true, data: grades });
}));

// Get student attendance (optionally filter by classroom)
router.get('/:id/attendance', asyncHandler(async (req, res, next) => {
    const attendance = await StudentService.getStudentAttendance(req.params.id, req.query.classroomId);
    res.status(200).json({ success: true, data: attendance });
}));

// Get all students (with pagination and filtering)
router.get('/', asyncHandler(async (req, res, next) => {
    const students = await StudentService.getAllStudents(req.query);
    res.status(200).json({ success: true, data: students });
}));

// Delete student profile
router.delete('/:id', asyncHandler(async (req, res, next) => {
    await StudentService.deleteStudent(req.params.id);
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
}));

module.exports = router;
