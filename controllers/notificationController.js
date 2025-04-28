const Notification = require('../models/Notification');

const notificationController = {
  // Get all notifications
  getAll: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        where: { owner_id: req.user.owner_id },
        order: [['created_at', 'DESC']]
      });
      
      // Transform the response to match frontend expectations
      const transformedNotifications = notifications.map(notification => ({
        id: notification.notification_id,
        recipient_id: notification.owner_id,
        message: notification.message,
        type: 'info', // Default type since we don't have this in DB
        read: notification.is_read,
        created_at: notification.created_at
      }));
      
      res.json(transformedNotifications);
    } catch (error) {
      console.error('Error in getAll notifications:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create a new notification
  create: async (req, res) => {
    try {
      const { owner_id, message } = req.body;
      
      const notification = await Notification.create({
        owner_id,
        message,
        is_read: false,
        created_at: new Date()
      });

      // Transform the response
      const transformedNotification = {
        id: notification.notification_id,
        recipient_id: notification.owner_id,
        message: notification.message,
        type: 'info',
        read: notification.is_read,
        created_at: notification.created_at
      };

      res.status(201).json(transformedNotification);
    } catch (error) {
      console.error('Error in create notification:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get unread notifications
  getUnread: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        where: { 
          owner_id: req.user.owner_id,
          is_read: false
        },
        order: [['created_at', 'DESC']]
      });

      // Transform the response
      const transformedNotifications = notifications.map(notification => ({
        id: notification.notification_id,
        recipient_id: notification.owner_id,
        message: notification.message,
        type: 'info',
        read: notification.is_read,
        created_at: notification.created_at
      }));

      res.json(transformedNotifications);
    } catch (error) {
      console.error('Error in getUnread notifications:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single notification
  getOne: async (req, res) => {
    try {
      const notification = await Notification.findOne({
        where: {
          id: req.params.id,
          recipient_id: req.user.id
        }
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const notification = await Notification.findOne({
        where: {
          notification_id: req.params.id,
          owner_id: req.user.owner_id
        }
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      notification.is_read = true;
      await notification.save();

      // Transform the response
      const transformedNotification = {
        id: notification.notification_id,
        recipient_id: notification.owner_id,
        message: notification.message,
        type: 'info',
        read: notification.is_read,
        created_at: notification.created_at
      };

      res.json(transformedNotification);
    } catch (error) {
      console.error('Error in markAsRead notification:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete a notification
  delete: async (req, res) => {
    try {
      const notification = await Notification.findOne({
        where: {
          notification_id: req.params.id,
          owner_id: req.user.owner_id
        }
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await notification.destroy();
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error in delete notification:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = notificationController; 