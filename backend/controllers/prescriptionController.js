// controllers/prescriptionController.js
const { Prescription, User } = require('../models');
const { sendEmail } = require('../utils/email');

// Doctor adds a new prescription for a patient
exports.addPrescription = async (req, res) => {
  try {
    const { patientId, medication, dosage, instructions } = req.body;
    const doctor = req.user;
    if (doctor.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can add prescriptions' });
    }
    if (!patientId || !medication || !dosage) {
      return res.status(400).json({ error: 'patientId, medication, and dosage are required' });
    }
    // Verify patient exists and is a patient
    const patientUser = await User.findOne({ where: { id: patientId, role: 'patient' } });
    if (!patientUser) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    // Create the prescription
    const prescription = await Prescription.create({
      patientId,
      doctorId: doctor.id,
      medication,
      dosage,
      instructions: instructions || ''
    });
    // Optionally, send an email to patient with the prescription details
    try {
      await sendEmail(patientUser.email, 'New Prescription', 
        `Dr. ${doctor.name} prescribed ${medication} (${dosage}). Instructions: ${instructions || 'N/A'}`);
    } catch (emailErr) {
      console.error('Failed to send prescription email:', emailErr);
    }
    return res.status(201).json({ message: 'Prescription added', prescription });
  } catch (err) {
    console.error('Add prescription error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get prescriptions for the current user
exports.getPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let prescriptions;
    if (role === 'doctor') {
      // Doctor: get prescriptions the doctor has given
      prescriptions = await Prescription.findAll({
        where: { doctorId: userId },
        include: [{ model: User, as: 'patient', attributes: ['id', 'name'] }]
      });
    } else if (role === 'patient') {
      // Patient: get their prescriptions
      prescriptions = await Prescription.findAll({
        where: { patientId: userId },
        include: [{ model: User, as: 'doctor', attributes: ['id', 'name'] }]
      });
    } else {
      prescriptions = [];
    }
    return res.json({ prescriptions });
  } catch (err) {
    console.error('Get prescriptions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
