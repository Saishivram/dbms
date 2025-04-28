const Newspaper = require('../models/Newspaper');
const { Op } = require('sequelize');
const { sendResponse, sendError } = require('../utils/responseUtils');

const newspaperController = {
  // Create a new newspaper
  create: async (req, res) => {
    try {
      const { name, title, publisher, frequency, price } = req.body;
      const owner_id = req.user.owner_id;
      
      console.log('Creating newspaper with owner_id:', owner_id);
      
      // Validate required fields
      if (!name || !title || !publisher || !frequency || !price) {
        return sendError(res, 400, 'All fields are required');
      }

      const newspaper = await Newspaper.create({
        name,
        title,
        publisher,
        frequency,
        price,
        owner_id
      });
      
      return sendResponse(res, 201, newspaper, 'Newspaper created successfully');
    } catch (error) {
      console.error('Error creating newspaper:', error);
      return sendError(res, 400, error.message);
    }
  },

  // Get all newspapers
  getAll: async (req, res) => {
    try {
      const owner_id = req.user.owner_id;
      console.log('Fetching newspapers for owner_id:', owner_id);
      console.log('User object:', req.user);
      
      // Log the query we're about to make
      console.log('Query parameters:', { where: { owner_id }, order: [['created_at', 'DESC']] });
      
      // Execute a raw SQL query first to verify data exists
      const [results] = await Newspaper.sequelize.query(
        'SELECT * FROM newspaper WHERE owner_id = ?',
        {
          replacements: [owner_id],
          type: Newspaper.sequelize.QueryTypes.SELECT
        }
      );
      console.log('Raw SQL query results:', results);

      const newspapers = await Newspaper.findAll({
        where: { owner_id },
        order: [['created_at', 'DESC']],
        raw: true // Add this to get plain objects
      });
      
      console.log('Raw newspapers result:', newspapers);
      console.log('Found newspapers:', newspapers.length);
      
      // Transform the data to match frontend expectations
      const transformedNewspapers = newspapers.map(paper => ({
        newspaper_id: paper.newspaper_id,
        name: paper.name,
        title: paper.title || paper.name,
        publisher: paper.publisher || 'Unknown',
        frequency: paper.frequency || 'Daily',
        price: parseFloat(paper.price) || 0,
        owner_id: paper.owner_id,
        created_at: paper.created_at
      }));
      
      console.log('Transformed newspapers:', transformedNewspapers);
      
      // Send the response in the expected format
      return res.status(200).json({
        success: true,
        message: '',
        data: transformedNewspapers
      });
    } catch (error) {
      console.error('Error fetching newspapers:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
        data: []
      });
    }
  },

  // Get a single newspaper
  getOne: async (req, res) => {
    try {
      const owner_id = req.user.owner_id;
      const newspaper = await Newspaper.findOne({
        where: {
          newspaper_id: req.params.id,
          owner_id
        }
      });
      
      if (!newspaper) {
        return sendError(res, 404, 'Newspaper not found');
      }
      return sendResponse(res, 200, newspaper);
    } catch (error) {
      console.error('Error fetching newspaper:', error);
      return sendError(res, 500, error.message);
    }
  },

  // Update a newspaper
  update: async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'title', 'publisher', 'frequency', 'price'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return sendError(res, 400, 'Invalid updates!');
    }

    try {
      const owner_id = req.user.owner_id;
      const newspaper = await Newspaper.findOne({
        where: {
          newspaper_id: req.params.id,
          owner_id
        }
      });
      
      if (!newspaper) {
        return sendError(res, 404, 'Newspaper not found');
      }

      updates.forEach(update => newspaper[update] = req.body[update]);
      await newspaper.save();
      return sendResponse(res, 200, newspaper, 'Newspaper updated successfully');
    } catch (error) {
      console.error('Error updating newspaper:', error);
      return sendError(res, 400, error.message);
    }
  },

  // Delete a newspaper
  delete: async (req, res) => {
    try {
      const owner_id = req.user.owner_id;
      const newspaper = await Newspaper.findOne({
        where: {
          newspaper_id: req.params.id,
          owner_id
        }
      });
      
      if (!newspaper) {
        return sendError(res, 404, 'Newspaper not found');
      }

      await newspaper.destroy();
      return sendResponse(res, 200, null, 'Newspaper deleted successfully');
    } catch (error) {
      console.error('Error deleting newspaper:', error);
      return sendError(res, 500, error.message);
    }
  }
};

module.exports = newspaperController; 