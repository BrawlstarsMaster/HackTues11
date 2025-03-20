// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, PatientData } = require('../models');  // import models
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '1h';  // token expiration time

// User registration
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);  // saltRounds = 10
    // Create new user
    const newUser = await User.create({ name, email, password: hashedPassword, role });
    // If the user is a patient, create an empty PatientData record for them
    if (role === 'patient') {
      await PatientData.create({ userId: newUser.id });
    }
    // Generate JWT token for the new user
    const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Credentials are valid -> generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Token validation (to check if a token is still valid)
exports.validateToken = (req, res) => {
  // If authMiddleware has passed, it means token is valid and req.user is set
  return res.json({ valid: true, user: req.user });
};
