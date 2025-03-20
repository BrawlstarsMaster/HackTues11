// utils/scheduler.js
const cron = require('node-cron');
const { Reminder, User } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('./email');

// Schedule a cron job to run every minute to check for due reminders
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Find all reminders that are due (remindAt <= now) and not yet sent
    const dueReminders = await Reminder.findAll({
      where: {
        sent: false,
        remindAt: { [Op.lte]: now }
      },
      include: [{ model: User, foreignKey: 'userId' }]
    });
    for (const reminder of dueReminders) {
      const user = reminder.User;
      if (!user) continue;
      // Send email notification to the user
      const subject = (reminder.type === 'appointment') ? 'Appointment Reminder' : 
                      (reminder.type === 'medication') ? 'Medication Reminder' : 'Reminder';
      const text = `Reminder: ${reminder.message} (scheduled at ${new Date(reminder.remindAt).toLocaleString()})`;
      try {
        await sendEmail(user.email, subject, text);
        // Mark reminder as sent
        reminder.sent = true;
        await reminder.save();
        console.log(`Sent reminder email to ${user.email} for reminder ${reminder.id}`);
      } catch (err) {
        console.error('Failed to send reminder email:', err);
      }
    }
  } catch (err) {
    console.error('Cron job error:', err);
  }
});
