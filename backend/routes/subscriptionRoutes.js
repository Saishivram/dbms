const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Subscription routes
router.post('/', subscriptionController.create);
router.get('/', subscriptionController.getAll);
router.get('/:id', subscriptionController.getOne);
router.patch('/:id', subscriptionController.update);
router.delete('/:id', subscriptionController.delete);

module.exports = router; 