// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// @route POST /api/appointments
// @desc  Create a new appointment (patient with doctor or vice versa)
router.post('/', auth, appointmentController.createAppointment);

// @route GET /api/appointments
// @desc  Get upcoming appointments for logged-in user
router.get('/', auth, appointmentController.getAppointments);

// @route DELETE /api/appointments/:id
// @desc  Cancel an appointment by ID (if current user is patient or doctor of that appointment)
router.delete('/:id', auth, appointmentController.cancelAppointment);

module.exports = router;
