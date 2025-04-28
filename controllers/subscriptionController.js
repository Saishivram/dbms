const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const Newspaper = require('../models/Newspaper');
const { sendResponse, sendError } = require('../utils/responseUtils');

const subscriptionController = {
  // Create a new subscription
  create: async (req, res) => {
    try {
      const { 
        customer_id, 
        newspaper_id, 
        start_date,
        end_date,
        status,
        monthly_fee,
        next_payment_date
      } = req.body;

      // Validate required fields
      if (!customer_id || !newspaper_id || !start_date || !monthly_fee || !next_payment_date) {
        return sendError(res, 400, 'Missing required fields');
      }

      // Validate customer and newspaper exist
      const customer = await Customer.findByPk(customer_id);
      const newspaper = await Newspaper.findByPk(newspaper_id);

      if (!customer || !newspaper) {
        return sendError(res, 404, 'Customer or Newspaper not found');
      }

      // Create the subscription
      const subscription = await Subscription.create({
        customer_id,
        newspaper_id,
        start_date,
        end_date: end_date || null,
        status: status || 'active',
        monthly_fee,
        next_payment_date
      });

      // Fetch the created subscription with associated data
      const subscriptionWithData = await Subscription.findByPk(subscription.subscription_id, {
        include: [
          { model: Customer },
          { model: Newspaper }
        ]
      });

      return sendResponse(res, 201, subscriptionWithData);
    } catch (error) {
      console.error('Error creating subscription:', error);
      return sendError(res, 400, error.message);
    }
  },

  // Get all subscriptions
  getAll: async (req, res) => {
    try {
      const subscriptions = await Subscription.findAll({
        include: [
          { model: Customer },
          { model: Newspaper }
        ]
      });
      return sendResponse(res, 200, subscriptions);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  },

  // Get a single subscription
  getOne: async (req, res) => {
    try {
      const subscription = await Subscription.findByPk(req.params.id, {
        include: [
          { model: Customer },
          { model: Newspaper }
        ]
      });

      if (!subscription) {
        return sendError(res, 404, 'Subscription not found');
      }

      return sendResponse(res, 200, subscription);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  },

  // Update a subscription
  update: async (req, res) => {
    try {
      const subscription = await Subscription.findByPk(req.params.id);

      if (!subscription) {
        return sendError(res, 404, 'Subscription not found');
      }

      const allowedUpdates = [
        'start_date',
        'end_date',
        'status',
        'monthly_fee',
        'next_payment_date'
      ];

      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      await subscription.update(updates);

      const updatedSubscription = await Subscription.findByPk(subscription.subscription_id, {
        include: [
          { model: Customer },
          { model: Newspaper }
        ]
      });

      return sendResponse(res, 200, updatedSubscription);
    } catch (error) {
      return sendError(res, 400, error.message);
    }
  },

  // Delete a subscription (soft delete by setting status to cancelled)
  delete: async (req, res) => {
    try {
      const subscription = await Subscription.findByPk(req.params.id);

      if (!subscription) {
        return sendError(res, 404, 'Subscription not found');
      }

      await subscription.update({ status: 'cancelled' });
      return sendResponse(res, 200, { message: 'Subscription cancelled successfully' });
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  }
};

module.exports = subscriptionController; 