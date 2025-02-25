const TeacherService = require('../services/TeacherService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Create a new teacher
 * @route   POST /api/teachers
 * @access  Private/Admin
 */
exports.createTeacher = asyncHandler(async (req, res, next) => {
    const teacher = await TeacherService.createTeacher(req.body);
    res.status(201).json({ success: true, data: teacher });
});

/**
 * @desc    Get teacher by ID
 * @route   GET /api/teachers/:id
 * @access  Private/Admin
 */
exports.getTeacherById = asyncHandler(async (req, res, next) => {
    const teacher = await TeacherService.getTeacherById(req.params.id);
    res.status(200).json({ success: true, data: teacher });
});

/**
 * @desc    Get teacher by user ID
 * @route   GET /api/teachers/user/:userId
 * @access  Private
 */
exports.getTeacherByUserId = asyncHandler(async (req, res, next) => {
    const teacher = await TeacherService.getTeacherByUserId(req.params.userId);
    res.status(200).json({ success: true, data: teacher });
});

/**
 * @desc    Update teacher profile
 * @route   PUT /api/teachers/:id
 * @access  Private/Admin
 */
exports.updateTeacher = asyncHandler(async (req, res, next) => {
    const updatedTeacher = await TeacherService.updateTeacher(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedTeacher });
});

/**
 * @desc    Get all classrooms for a teacher
 * @route   GET /api/teachers/:id/classrooms
 * @access  Private
 */
exports.getTeacherClassrooms = asyncHandler(async (req, res, next) => {
    const classrooms = await TeacherService.getTeacherClassrooms(req.params.id);
    res.status(200).json({ success: true, data: classrooms });
});

/**
 * @desc    Get all teachers (with pagination & filtering)
 * @route   GET /api/teachers
 * @access  Private/Admin
 */
exports.getAllTeachers = asyncHandler(async (req, res, next) => {
    const teachers = await TeacherService.getAllTeachers(req.query);
    res.status(200).json({ success: true, data: teachers });
});

/**
 * @desc    Add a subject to teacher
 * @route   PUT /api/teachers/:id/add-subject
 * @access  Private/Admin
 */
exports.addSubject = asyncHandler(async (req, res, next) => {
    const updatedTeacher = await TeacherService.addSubject(req.params.id, req.body.subject);
    res.status(200).json({ success: true, data: updatedTeacher });
});

/**
 * @desc    Remove a subject from teacher
 * @route   PUT /api/teachers/:id/remove-subject
 * @access  Private/Admin
 */
exports.removeSubject = asyncHandler(async (req, res, next) => {
    const updatedTeacher = await TeacherService.removeSubject(req.params.id, req.body.subject);
    res.status(200).json({ success: true, data: updatedTeacher });
});

/**
 * @desc    Delete a teacher profile
 * @route   DELETE /api/teachers/:id
 * @access  Private/Admin
 */
exports.deleteTeacher = asyncHandler(async (req, res, next) => {
    await TeacherService.deleteTeacher(req.params.id);
    res.status(200).json({ success: true, message: 'Teacher profile deleted' });
});
