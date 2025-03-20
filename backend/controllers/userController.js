// controllers/userController.js
const { User, PatientData, Habit } = require('../models');
const path = require('path');
const fs = require('fs');

// Get current user's profile (with patient details & habits if applicable)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    // Include patient data and habits in profile if available
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },  // omit password field
      include: [
        { model: PatientData, foreignKey: 'userId' },
        { model: Habit, foreignKey: 'userId', attributes: ['id','description','frequency'] }
      ]
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ profile: user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile details
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, height, weight, allergies, dietaryRestrictions } = req.body;
    // Find user and update allowed fields
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Update basic user fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    // (In a real app, changing email might require re-validation. Here we assume direct change.)
    await user.save();
    // If this user is a patient, update their PatientData as well
    let patientData = await PatientData.findOne({ where: { userId } });
    if (patientData) {
      if (height !== undefined) patientData.height = height;
      if (weight !== undefined) patientData.weight = weight;
      if (allergies !== undefined) patientData.allergies = allergies;
      if (dietaryRestrictions !== undefined) patientData.dietaryRestrictions = dietaryRestrictions;
      await patientData.save();
    }
    return res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload (or update) profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Remove old profile picture file if exists
    if (user.profilePicture) {
      try {
        fs.unlinkSync(path.resolve(user.profilePicture));
      } catch (err) {
        console.warn('Old profile picture could not be deleted:', err);
      }
    }
    // Save new profile picture path
    user.profilePicture = req.file.path;
    await user.save();
    return res.json({ message: 'Profile picture updated', path: user.profilePicture });
  } catch (err) {
    console.error('Upload profile picture error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
