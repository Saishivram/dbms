const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Chatbot routes
router.post('/query', chatbotController.handleQuery);

module.exports = router; 