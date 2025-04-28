const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

const paymentController = {
  // Get all payments
  getAll: async (req, res) => {
    try {
      const payments = await Payment.findAll({
        include: [{
          model: Subscription,
          include: ['Customer']
        }],
        order: [['payment_date', 'DESC']]
      });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create a new payment
  create: async (req, res) => {
    try {
      const { subscription_id, amount, payment_date } = req.body;
      
      // Get subscription details
      const subscription = await Subscription.findByPk(subscription_id);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      // Create payment record
      const payment = await Payment.create({
        subscription_id,
        amount,
        payment_date,
        due_date: subscription.next_payment_date
      });

      // Update next payment date
      const nextPaymentDate = new Date(subscription.next_payment_date);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      await subscription.update({ next_payment_date: nextPaymentDate });

      // Create notification if payment is late
      if (payment.status === 'late') {
        await Notification.create({
          admin_id: req.owner.owner_id,
          message: `Late payment received for subscription ${subscription_id}`
        });
      }

      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all payments for a subscription
  getBySubscription: async (req, res) => {
    try {
      const payments = await Payment.findAll({
        where: { subscription_id: req.params.subscriptionId },
        order: [['payment_date', 'DESC']]
      });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get late payments
  getLatePayments: async (req, res) => {
    try {
      const latePayments = await Payment.findAll({
        where: { status: 'late' },
        include: [{
          model: Subscription,
          include: ['Customer']
        }]
      });
      res.json(latePayments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get payment analytics
  getAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const totalPayments = await Payment.sum('amount', {
        where: {
          payment_date: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      const latePayments = await Payment.count({
        where: {
          status: 'late',
          payment_date: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      const suspendedSubscriptions = await Subscription.count({
        where: {
          status: 'suspended'
        }
      });

      res.json({
        totalPayments,
        latePayments,
        suspendedSubscriptions
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = paymentController; 