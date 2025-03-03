const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const userData = req.body;
        const result = await AuthService.register(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await AuthService.refreshToken(refreshToken);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

/**
 * @route   POST /auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const resetToken = await AuthService.forgotPassword(email);
        res.status(200).json({ resetToken });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const success = await AuthService.resetPassword(token, newPassword);
        res.status(200).json({ success });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route   POST /auth/update-password
 * @desc    Update user password
 * @access  Private (requires authentication)
 */
router.post('/update-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        const success = await AuthService.updatePassword(userId, currentPassword, newPassword);
        res.status(200).json({ success });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
