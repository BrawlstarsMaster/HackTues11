// models/index.js
const sequelize = require('../config/database');

const User = require('./User');
const PatientData = require('./PatientData');
const MedicalHistory = require('./MedicalHistory');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const Reminder = require('./Reminder');
const Chat = require('./Chat');
const Habit = require('./Habit');

// Define associations between models:

// 1-1: User <-> PatientData (each patient user has one PatientData record)
User.hasOne(PatientData, { foreignKey: 'userId', onDelete: 'CASCADE' });
PatientData.belongsTo(User, { foreignKey: 'userId' });

// 1-N: User <-> MedicalHistory (one user can have many medical history records; each record may have a doctor)
User.hasMany(MedicalHistory, { as: 'medicalRecords', foreignKey: 'userId' });  // patient's records
User.hasMany(MedicalHistory, { as: 'recordsAdded', foreignKey: 'doctorId' });  // records added by a doctor
MedicalHistory.belongsTo(User, { as: 'patient', foreignKey: 'userId' });
MedicalHistory.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

// 1-N: User <-> Appointment (one user (doctor or patient) can have many appointments)
User.hasMany(Appointment, { as: 'doctorAppointments', foreignKey: 'doctorId' });
User.hasMany(Appointment, { as: 'patientAppointments', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });

// 1-N: User <-> Prescription
User.hasMany(Prescription, { as: 'givenPrescriptions', foreignKey: 'doctorId' });
User.hasMany(Prescription, { as: 'receivedPrescriptions', foreignKey: 'patientId' });
Prescription.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
Prescription.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });

// 1-N: User <-> Reminder
User.hasMany(Reminder, { foreignKey: 'userId' });
Reminder.belongsTo(User, { foreignKey: 'userId' });

// 1-N: User <-> Chat (User as sender and receiver)
User.hasMany(Chat, { as: 'sentMessages', foreignKey: 'senderId' });
User.hasMany(Chat, { as: 'receivedMessages', foreignKey: 'receiverId' });
Chat.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Chat.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// 1-N: User <-> Habit
User.hasMany(Habit, { foreignKey: 'userId' });
Habit.belongsTo(User, { foreignKey: 'userId' });

// Export all models for easy import
module.exports = {
  sequelize,
  User,
  PatientData,
  MedicalHistory,
  Appointment,
  Prescription,
  Reminder,
  Chat,
  Habit
};
