const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');

// Public routes
router.post('/login', employeeController.login);

// Protected routes
router.use(auth);
router.post('/', employeeController.create);
router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getOne);
router.patch('/:id', employeeController.update);
router.delete('/:id', employeeController.delete);

module.exports = router; 