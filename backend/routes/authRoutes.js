// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user (patient or doctor)
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user and return JWT
router.post('/login', authController.login);

// @route   GET /api/auth/validate
// @desc    Validate JWT and get user info (token must be provided)
router.get('/validate', authMiddleware, authController.validateToken);

module.exports = router;
