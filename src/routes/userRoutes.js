const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all users with pagination and filtering
router.get('/', userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user details
router.put('/:id', userController.updateUser);

// Update user role (admin only)
router.put('/:id/role', userController.updateUserRole);

// Activate or deactivate user
router.put('/:id/status', userController.setUserStatus);

// Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;
