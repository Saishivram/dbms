const express = require('express');
const router = express.Router();
const newspaperController = require('../controllers/newspaperController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Newspaper routes
router.post('/', newspaperController.create);
router.get('/', newspaperController.getAll);
router.get('/:id', newspaperController.getOne);
router.patch('/:id', newspaperController.update);
router.delete('/:id', newspaperController.delete);

module.exports = router; 