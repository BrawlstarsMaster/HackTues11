// controllers/reminderController.js
const { Reminder } = require('../models');

exports.addReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, message, remindAt } = req.body;
    if (!message || !remindAt) {
      return res.status(400).json({ error: 'Message and remindAt datetime are required' });
    }
    // Create the reminder (it will initially be unsent)
    const reminder = await Reminder.create({
      userId,
      type: type || 'general',
      message,
      remindAt
    });
    return res.status(201).json({ message: 'Reminder created', reminder });
  } catch (err) {
    console.error('Add reminder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch reminders for the user, optionally only future ones
    const reminders = await Reminder.findAll({
      where: { userId, sent: false },
      order: [['remindAt', 'ASC']]
    });
    return res.json({ reminders });
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
