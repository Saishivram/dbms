const sequelize = require('./sequelize');

// Function to initialize database connection and sync models
const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Import and setup associations
    try {
      require('../models/associations');
      console.log('Model associations have been set up successfully.');
    } catch (associationError) {
      console.error('Error setting up model associations:', associationError);
      throw associationError;
    }

    // Sync all models without forcing recreation
    try {
      await sequelize.sync({ force: false });
      console.log('All models were synchronized successfully.');
    } catch (syncError) {
      console.error('Error synchronizing models:', syncError);
      console.error('Sync error details:', syncError.parent || syncError);
      throw syncError;
    }

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    console.error('Connection error details:', error.parent || error);
    
    // Check if error is related to missing database
    if (error.parent?.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Please create the database and try again.');
    }
    
    throw error;
  }
};

module.exports = { sequelize, initializeDatabase }; 