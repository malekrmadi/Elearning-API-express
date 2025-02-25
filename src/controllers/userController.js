const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');


/**
 * @route GET /users
 * @desc Get all users with pagination and filtering
 */
router.get('/users', async (req, res) => {
    try {
        const { page, limit, ...query } = req.query;
        const users = await UserService.getUsers(query, Number(page), Number(limit));
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route GET /users/:id
 * @desc Get user by ID
 */
router.get('/users/:id', async (req, res) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

/**
 * @route PUT /users/:id
 * @desc Update user details
 */
router.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await UserService.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @route PUT /users/:id/role
 * @desc Update user role (admin only)
 */
router.put('/users/:id/role', async (req, res) => {
    try {
        const updatedUser = await UserService.updateUserRole(req.params.id, req.body.role);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @route PUT /users/:id/status
 * @desc Activate or deactivate user
 */
router.put('/users/:id/status', async (req, res) => {
    try {
        const updatedUser = await UserService.setUserStatus(req.params.id, req.body.isActive);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @route DELETE /users/:id
 * @desc Delete user (admin only)
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const success = await UserService.deleteUser(req.params.id);
        res.json({ success });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
