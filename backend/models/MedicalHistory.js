// models/MedicalHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalHistory = sequelize.define('MedicalHistory', {
  userId: {  // patient
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  doctorId: {  // doctor who added this record (if any)
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  filePath: {  // path to an uploaded document related to this record
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = MedicalHistory;
