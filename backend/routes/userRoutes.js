// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route GET /api/users/profile
// @desc  Get logged-in user's profile (requires JWT)
router.get('/profile', auth, userController.getProfile);

// @route PUT /api/users/update
// @desc  Update profile details (name, email, patient data) (requires JWT)
router.put('/update', auth, userController.updateProfile);

// @route POST /api/users/upload
// @desc  Upload or change profile picture (requires JWT)
router.post('/upload', auth, upload.single('image'), userController.uploadProfilePicture);

module.exports = router;
