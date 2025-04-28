const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', ownerController.register);
router.post('/login', ownerController.login);

// Protected routes
router.get('/profile', auth, ownerController.getProfile);
router.patch('/profile', auth, ownerController.updateProfile);

module.exports = router; 