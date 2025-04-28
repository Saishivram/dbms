const Owner = require('../models/Owner');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ownerController = {
  // Register a new owner
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const owner = await Owner.create({ name, email, password });
      const token = jwt.sign({ owner_id: owner.owner_id }, process.env.JWT_SECRET);
      res.status(201).json({ owner, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Login owner
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const owner = await Owner.findOne({ where: { email } });
      
      if (!owner) {
        throw new Error('Invalid login credentials');
      }

      const isMatch = await bcrypt.compare(password, owner.password);
      if (!isMatch) {
        throw new Error('Invalid login credentials');
      }

      const token = jwt.sign({ owner_id: owner.owner_id }, process.env.JWT_SECRET);
      res.json({
        token,
        owner: {
          owner_id: owner.owner_id,
          name: owner.name,
          email: owner.email
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get owner profile
  getProfile: async (req, res) => {
    try {
      const owner = await Owner.findByPk(req.owner.owner_id, {
        attributes: { exclude: ['password'] }
      });
      res.json(owner);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update owner profile
  updateProfile: async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
      updates.forEach(update => req.owner[update] = req.body[update]);
      await req.owner.save();
      res.json(req.owner);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = ownerController; 