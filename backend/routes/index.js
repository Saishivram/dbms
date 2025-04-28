const express = require('express');
const router = express.Router();

const ownerRoutes = require('./ownerRoutes');
const employeeRoutes = require('./employeeRoutes');
const customerRoutes = require('./customerRoutes');
const newspaperRoutes = require('./newspaperRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const paymentRoutes = require('./paymentRoutes');
const notificationRoutes = require('./notificationRoutes');
const chatbotRoutes = require('./chatbotRoutes');

router.use('/owners', ownerRoutes);
router.use('/employees', employeeRoutes);
router.use('/customers', customerRoutes);
router.use('/newspapers', newspaperRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chatbot', chatbotRoutes);

module.exports = router; 