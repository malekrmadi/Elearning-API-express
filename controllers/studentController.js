const express = require('express');
const StudentService = require('./services/StudentService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @route   POST /api/students
// @desc    Create a new student
// @access  Private
router.post('/', asyncHandler(async (req, res, next) => {
    const student = await StudentService.createStudent(req.body);
    res.status(201).json({ success: true, data: student });
}));

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res, next) => {
    const student = await StudentService.getStudentById(req.params.id);
    res.status(200).json({ success: true, data: student });
}));

// @route   GET /api/students/user/:userId
// @desc    Get student by user ID
// @access  Private
router.get('/user/:userId', asyncHandler(async (req, res, next) => {
    const student = await StudentService.getStudentByUserId(req.params.userId);
    res.status(200).json({ success: true, data: student });
}));

// @route   PUT /api/students/:id
// @desc    Update student profile
// @access  Private
router.put('/:id', asyncHandler(async (req, res, next) => {
    const student = await StudentService.updateStudent(req.params.id, req.body);
    res.status(200).json({ success: true, data: student });
}));

// @route   GET /api/students/:id/classrooms
// @desc    Get all classrooms for a student
// @access  Private
router.get('/:id/classrooms', asyncHandler(async (req, res, next) => {
    const classrooms = await StudentService.getStudentClassrooms(req.params.id);
    res.status(200).json({ success: true, data: classrooms });
}));

// @route   POST /api/students/:id/enroll/:classroomId
// @desc    Enroll student in a classroom
// @access  Private
router.post('/:id/enroll/:classroomId', asyncHandler(async (req, res, next) => {
    const result = await StudentService.enrollInClassroom(req.params.id, req.params.classroomId);
    res.status(200).json({ success: true, data: result });
}));

// @route   DELETE /api/students/:id/withdraw/:classroomId
// @desc    Withdraw student from a classroom
// @access  Private
router.delete('/:id/withdraw/:classroomId', asyncHandler(async (req, res, next) => {
    const result = await StudentService.withdrawFromClassroom(req.params.id, req.params.classroomId);
    res.status(200).json({ success: true, data: result });
}));

// @route   GET /api/students/:id/grades
// @desc    Get student grades (optionally filter by classroom)
// @access  Private
router.get('/:id/grades', asyncHandler(async (req, res, next) => {
    const grades = await StudentService.getStudentGrades(req.params.id, req.query.classroomId);
    res.status(200).json({ success: true, data: grades });
}));

// @route   GET /api/students/:id/attendance
// @desc    Get student attendance (optionally filter by classroom)
// @access  Private
router.get('/:id/attendance', asyncHandler(async (req, res, next) => {
    const attendance = await StudentService.getStudentAttendance(req.params.id, req.query.classroomId);
    res.status(200).json({ success: true, data: attendance });
}));

// @route   GET /api/students
// @desc    Get all students (with pagination and filtering)
// @access  Private
router.get('/', asyncHandler(async (req, res, next) => {
    const students = await StudentService.getAllStudents(req.query);
    res.status(200).json({ success: true, data: students });
}));

// @route   DELETE /api/students/:id
// @desc    Delete student profile
// @access  Private
router.delete('/:id', asyncHandler(async (req, res, next) => {
    await StudentService.deleteStudent(req.params.id);
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
}));

module.exports = router;
