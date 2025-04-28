const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');

const customerController = {
  // Create a new customer
  create: async (req, res) => {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all customers
  getAll: async (req, res) => {
    try {
      const customers = await Customer.findAll({
        include: [{
          model: Subscription,
          include: ['Newspaper']
        }]
      });
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single customer with subscriptions
  getOne: async (req, res) => {
    try {
      const customer = await Customer.findByPk(req.params.id, {
        include: [{
          model: Subscription,
          include: ['Newspaper']
        }]
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a customer
  update: async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'phone', 'address'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      updates.forEach(update => customer[update] = req.body[update]);
      await customer.save();
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete a customer
  delete: async (req, res) => {
    try {
      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      await customer.destroy();
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = customerController; 