const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Customer routes
router.post('/', customerController.create);
router.get('/', customerController.getAll);
router.get('/:id', customerController.getOne);
router.patch('/:id', customerController.update);
router.delete('/:id', customerController.delete);

module.exports = router; 