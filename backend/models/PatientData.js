// models/PatientData.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PatientData = sequelize.define('PatientData', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'Users', key: 'id' }
  },
  height: DataTypes.FLOAT,              // in cm (for example)
  weight: DataTypes.FLOAT,              // in kg
  allergies: DataTypes.TEXT,           // comma-separated or JSON of allergies
  dietaryRestrictions: DataTypes.TEXT  // any dietary notes
}, {
  timestamps: false
});

module.exports = PatientData;
