// controllers/appointmentController.js
const { Appointment, User } = require('../models');

const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');  // email utility to send notifications

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, scheduledAt, reason } = req.body;
    const requester = req.user;  // from authMiddleware
    let finalDoctorId = doctorId;
    let finalPatientId = patientId;
    // Determine roles: if patient is creating, they are the patient; if doctor is creating, they are the doctor
    if (requester.role === 'patient') {
      finalPatientId = requester.id;
      finalDoctorId = doctorId;
    } else if (requester.role === 'doctor') {
      finalDoctorId = requester.id;
      finalPatientId = patientId;
    }
    if (!finalDoctorId || !finalPatientId || !scheduledAt) {
      return res.status(400).json({ error: 'doctorId, patientId, and scheduledAt are required' });
    }
    // Verify the doctorId actually belongs to a doctor user, and patientId to a patient user
    const doctorUser = await User.findOne({ where: { id: finalDoctorId, role: 'doctor' } });
    const patientUser = await User.findOne({ where: { id: finalPatientId, role: 'patient' } });
    if (!doctorUser || !patientUser) {
      return res.status(400).json({ error: 'Invalid doctor or patient ID' });
    }
    // (Optional: Check scheduling conflicts or times in the past here)
    // Create the appointment
    const appointment = await Appointment.create({
      patientId: finalPatientId,
      doctorId: finalDoctorId,
      scheduledAt,
      reason: reason || ''
    });
    // Send email notifications to both doctor and patient about the appointment
    try {
      await sendEmail(patientUser.email, 'Appointment Scheduled', 
        `You have an appointment with Dr. ${doctorUser.name} on ${new Date(scheduledAt).toLocaleString()}.`);
      await sendEmail(doctorUser.email, 'New Appointment', 
        `You have a new appointment with patient ${patientUser.name} on ${new Date(scheduledAt).toLocaleString()}.`);
    } catch (emailErr) {
      console.error('Failed to send appointment notification emails:', emailErr);
    }
    // (Optional: Create an automatic reminder, e.g., 1 day before appointment)
    // Respond with the created appointment
    return res.status(201).json({ message: 'Appointment created', appointment });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get upcoming appointments for the logged-in user (patient or doctor)
exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let whereClause;
    if (role === 'doctor') {
      whereClause = { doctorId: userId };
    } else if (role === 'patient') {
      whereClause = { patientId: userId };
    } else {
      // If other roles exist (not in this app), default to none
      whereClause = {};
    }
    // Only future or pending appointments (scheduled)
    whereClause.status = 'scheduled';
    whereClause.scheduledAt = { [Op.gte]: new Date() };
    // Find appointments, include counterpart user details for context
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'patient', attributes: ['id', 'name', 'email'] }
      ],
      order: [['scheduledAt', 'ASC']]
    });
    return res.json({ appointments });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel (delete) an appointment by ID
exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    // Only allow cancellation if the requester is either the patient or doctor of this appointment
    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }
    // Delete the appointment
    await Appointment.destroy({ where: { id: appointmentId } });
    // (Optional: send cancellation emails to both parties)
    return res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
