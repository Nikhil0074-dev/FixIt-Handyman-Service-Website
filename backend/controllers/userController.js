const User = require('../models/User');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const userId = await User.create({ name, email, password, phone, address, role });

    // If registering as provider, create provider record
    if (role === 'provider') {
      await db.query('INSERT INTO service_providers (user_id) VALUES (?)', [userId]);
    }

    const user = await User.findById(userId);
    const token = generateToken(user);
    res.status(201).json({ success: true, message: 'Registration successful', token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: 'Login successful', token, user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    await User.update(req.user.id, { name, phone, address });
    const user = await User.findById(req.user.id);
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: PATCH /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    await User.toggleStatus(req.params.id);
    res.json({ success: true, message: 'User status toggled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile, getAllUsers, toggleUserStatus };
