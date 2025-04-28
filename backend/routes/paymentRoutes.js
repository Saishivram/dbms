const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Payment routes
router.get('/', paymentController.getAll);
router.post('/', paymentController.create);
router.get('/subscription/:subscriptionId', paymentController.getBySubscription);
router.get('/late', paymentController.getLatePayments);
router.get('/analytics', paymentController.getAnalytics);

module.exports = router; 