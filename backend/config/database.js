// config/database.js
require('dotenv').config();  // Load environment variables from .env

const { Sequelize } = require('sequelize');

// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: false,         // disable SQL query logging for security and cleanliness
  pool: { max: 5, min: 0, idle: 10000 }
});

module.exports = sequelize;
