const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Notification routes
router.get('/', notificationController.getAll);
router.post('/', notificationController.create);
router.get('/unread', notificationController.getUnread);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.delete);

module.exports = router; 