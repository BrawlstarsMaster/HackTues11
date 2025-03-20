const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware'); // Ensure user is authenticated

// Get chat messages between two users
router.get('/:userId', authMiddleware, chatController.getMessages);

// Send a message
router.post('/', authMiddleware, chatController.sendMessage);

module.exports = router;
