// models/Chat.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chat = sequelize.define('Chat', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true  // createdAt will act as message timestamp
});

module.exports = Chat;
