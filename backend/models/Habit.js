// models/Habit.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Habit = sequelize.define('Habit', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: true  // e.g., "daily", "3 times/week", etc.
  }
}, {
  timestamps: true
});

module.exports = Habit;
