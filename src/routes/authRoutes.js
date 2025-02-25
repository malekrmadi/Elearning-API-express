const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Refresh access token
router.post('/refresh-token', authController.refreshToken);

// Send password reset email
router.post('/forgot-password', authController.forgotPassword);

// Reset password using token
router.post('/reset-password', authController.resetPassword);

// Update user password
router.post('/update-password', authController.updatePassword);

module.exports = router;
