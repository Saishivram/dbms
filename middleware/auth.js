const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Received token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      // Set the user information in the request
      req.user = {
        ...decoded,
        owner_id: decoded.owner_id || decoded.id // Handle both owner_id and id
      };
      
      console.log('User object set in request:', req.user);
      
      // Verify the owner exists
      const owner = await Owner.findByPk(req.user.owner_id);
      console.log('Found owner:', owner ? `ID: ${owner.owner_id}, Name: ${owner.name}` : 'No owner found');
      
      if (!owner) {
        console.log('Owner not found for ID:', req.user.owner_id);
        return res.status(401).json({ message: 'Owner not found' });
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = auth; 