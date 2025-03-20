// routes/reminderRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const reminderController = require('../controllers/reminderController');

// @route POST /api/reminders
// @desc  Add a new reminder (for logged-in user)
router.post('/', auth, reminderController.addReminder);

// @route GET /api/reminders
// @desc  Get all pending reminders for logged-in user
router.get('/', auth, reminderController.getReminders);

module.exports = router;
