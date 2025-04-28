const Employee = require('../models/Employee');
const { Op } = require('sequelize');
const { sendResponse, sendError } = require('../utils/responseUtils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const employeeController = {
  // Create a new employee
  create: async (req, res) => {
    try {
      const { name, email, password, phone, role, owner_id } = req.body;
      
      // Validate required fields
      const requiredFields = ['name', 'email', 'password', 'owner_id'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return sendError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendError(res, 400, 'Invalid email format');
      }

      // Check if employee with email already exists
      const existingEmployee = await Employee.findOne({ where: { email } });
      if (existingEmployee) {
        return sendError(res, 400, 'Employee with this email already exists');
      }

      // Set default role if not provided
      const employeeRole = role || 'delivery';

      // Create the employee with all fields
      const employee = await Employee.create({
        name,
        email,
        password, // Password will be hashed by model hooks
        phone: phone || null, // Make phone optional
        role: employeeRole,
        owner_id
      });
      
      // Remove password from response
      const employeeResponse = employee.toJSON();
      delete employeeResponse.password;
      
      return sendResponse(res, 201, employeeResponse, 'Employee created successfully');
    } catch (error) {
      console.error('Error creating employee:', error);
      return sendError(res, 500, 'Error creating employee: ' + error.message);
    }
  },

  // Get all employees
  getAll: async (req, res) => {
    try {
      const owner_id = req.user.owner_id;
      const employees = await Employee.findAll({
        where: { owner_id },
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']]
      });
      return sendResponse(res, 200, employees);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  },

  // Get employees by owner
  getByOwner: async (req, res) => {
    try {
      const { owner_id } = req.params;
      const employees = await Employee.findAll({
        where: { owner_id },
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']]
      });
      return sendResponse(res, 200, employees);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  },

  // Get a single employee
  getOne: async (req, res) => {
    try {
      const employee = await Employee.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });
      if (!employee) {
        return sendError(res, 404, 'Employee not found');
      }
      return sendResponse(res, 200, employee);
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  },

  // Update an employee
  update: async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'phone', 'role', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return sendError(res, 400, 'Invalid updates!');
    }

    try {
      const employee = await Employee.findByPk(req.params.id);
      if (!employee) {
        return sendError(res, 404, 'Employee not found');
      }

      // Check if email is being updated and if it already exists
      if (req.body.email && req.body.email !== employee.email) {
        const existingEmployee = await Employee.findOne({ 
          where: { 
            email: req.body.email,
            employee_id: { [Op.ne]: req.params.id }
          } 
        });
        if (existingEmployee) {
          return sendError(res, 400, 'Employee with this email already exists');
        }
      }

      // Validate email format if being updated
      if (req.body.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
          return sendError(res, 400, 'Invalid email format');
        }
      }

      updates.forEach(update => employee[update] = req.body[update]);
      await employee.save();

      // Remove password from response
      const employeeResponse = employee.toJSON();
      delete employeeResponse.password;

      return sendResponse(res, 200, employeeResponse, 'Employee updated successfully');
    } catch (error) {
      return sendError(res, 400, error.message);
    }
  },

  // Delete an employee
  delete: async (req, res) => {
    try {
      const employee = await Employee.findByPk(req.params.id);
      if (!employee) {
        return sendError(res, 404, 'Employee not found');
      }

      await employee.destroy();
      return sendResponse(res, 200, null, 'Employee deleted successfully');
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  },

  // Employee login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return sendError(res, 400, 'Email and password are required');
      }

      // Find employee by email
      const employee = await Employee.findOne({ where: { email } });
      if (!employee) {
        return sendError(res, 401, 'Invalid credentials');
      }

      // Verify password
      const isValidPassword = await employee.comparePassword(password);
      if (!isValidPassword) {
        return sendError(res, 401, 'Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: employee.employee_id, 
          email: employee.email, 
          role: employee.role,
          owner_id: employee.owner_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const employeeResponse = employee.toJSON();
      delete employeeResponse.password;

      return sendResponse(res, 200, {
        token,
        employee: employeeResponse
      }, 'Login successful');
    } catch (error) {
      return sendError(res, 500, 'Error during login: ' + error.message);
    }
  }
};

module.exports = employeeController; 