// models/Reminder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reminder = sequelize.define('Reminder', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  type: {
    type: DataTypes.ENUM('appointment', 'medication', 'general'),
    allowNull: false,
    defaultValue: 'general'
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remindAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = Reminder;
