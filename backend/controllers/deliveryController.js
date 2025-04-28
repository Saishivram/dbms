const Delivery = require('../models/Delivery');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Newspaper = require('../models/Newspaper');
const { Op } = require('sequelize');

const deliveryController = {
  // Create a new delivery
  create: async (req, res) => {
    try {
      const { employee_id, customer_id, newspaper_id, delivery_date } = req.body;

      // Validate employee, customer, and newspaper exist
      const employee = await Employee.findByPk(employee_id);
      const customer = await Customer.findByPk(customer_id);
      const newspaper = await Newspaper.findByPk(newspaper_id);

      if (!employee || !customer || !newspaper) {
        return res.status(404).json({ error: 'Employee, Customer, or Newspaper not found' });
      }

      const delivery = await Delivery.create({
        employee_id,
        customer_id,
        newspaper_id,
        delivery_date
      });

      res.status(201).json(delivery);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all deliveries
  getAll: async (req, res) => {
    try {
      const deliveries = await Delivery.findAll({
        include: [
          { model: Employee },
          { model: Customer },
          { model: Newspaper }
        ]
      });
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get deliveries by date range
  getByDateRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const deliveries = await Delivery.findAll({
        where: {
          delivery_date: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [
          { model: Employee },
          { model: Customer },
          { model: Newspaper }
        ]
      });
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get deliveries by employee
  getByEmployee: async (req, res) => {
    try {
      const deliveries = await Delivery.findAll({
        where: { employee_id: req.params.employeeId },
        include: [
          { model: Employee },
          { model: Customer },
          { model: Newspaper }
        ]
      });
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get delivery analytics
  getAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Get total deliveries
      const totalDeliveries = await Delivery.count({
        where: {
          delivery_date: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      // Get deliveries by employee
      const deliveriesByEmployee = await Delivery.findAll({
        where: {
          delivery_date: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [{ model: Employee }],
        group: ['employee_id'],
        attributes: [
          'employee_id',
          [sequelize.fn('COUNT', sequelize.col('delivery_id')), 'delivery_count']
        ]
      });

      // Get deliveries by newspaper
      const deliveriesByNewspaper = await Delivery.findAll({
        where: {
          delivery_date: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [{ model: Newspaper }],
        group: ['newspaper_id'],
        attributes: [
          'newspaper_id',
          [sequelize.fn('COUNT', sequelize.col('delivery_id')), 'delivery_count']
        ]
      });

      res.json({
        totalDeliveries,
        deliveriesByEmployee,
        deliveriesByNewspaper
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a delivery
  update: async (req, res) => {
    try {
      const delivery = await Delivery.findByPk(req.params.id);
      
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }

      // Only allow status updates
      if (req.body.status) {
        delivery.status = req.body.status;
        await delivery.save();

        // Fetch updated delivery with associations
        const updatedDelivery = await Delivery.findByPk(delivery.delivery_id, {
          include: [
            { model: Employee },
            { model: Customer },
            { model: Newspaper }
          ]
        });

        return res.json(updatedDelivery);
      }

      return res.status(400).json({ error: 'Invalid update parameters' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = deliveryController; 