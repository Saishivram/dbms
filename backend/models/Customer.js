const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Customer = sequelize.define('Customer', {
  customer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'customer',
  timestamps: false,
  underscored: true
});

module.exports = Customer; 