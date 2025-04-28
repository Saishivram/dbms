const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Delivery routes
router.post('/', deliveryController.create);
router.get('/', deliveryController.getAll);
router.get('/date-range', deliveryController.getByDateRange);
router.get('/employee/:employeeId', deliveryController.getByEmployee);
router.get('/analytics', deliveryController.getAnalytics);
router.patch('/:id', deliveryController.update);

module.exports = router; 