const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    define: {
      underscored: true,
      timestamps: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // For handling large numbers precisely
      decimalNumbers: true,
      // Throw errors for undefined fields
      supportBigNumbers: true,
      // Enable multiple statements in one query (useful for migrations)
      multipleStatements: true
    },
    // Throw error when undefined fields are passed
    rejectOnEmpty: true,
    // Better error messages
    benchmark: process.env.NODE_ENV === 'development'
  }
);

module.exports = sequelize; 