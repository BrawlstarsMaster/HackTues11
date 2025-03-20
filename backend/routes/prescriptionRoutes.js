// routes/prescriptionRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const prescriptionController = require('../controllers/prescriptionController');

// @route POST /api/prescriptions
// @desc  Add a new prescription (doctor only)
router.post('/', auth, prescriptionController.addPrescription);

// @route GET /api/prescriptions
// @desc  Get all prescriptions for current user (if patient -> their prescriptions, if doctor -> prescriptions given)
router.get('/', auth, prescriptionController.getPrescriptions);

module.exports = router;
