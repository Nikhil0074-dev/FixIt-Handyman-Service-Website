const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getAllUsers, toggleUserStatus } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.put('/users/profile', protect, updateProfile);
router.get('/admin/users', protect, adminOnly, getAllUsers);
router.patch('/admin/users/:id/toggle', protect, adminOnly, toggleUserStatus);

module.exports = router;
