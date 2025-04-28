const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Delivery = sequelize.define('Delivery', {
  delivery_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employee',
      key: 'employee_id'
    }
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customer',
      key: 'customer_id'
    }
  },
  newspaper_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'newspaper',
      key: 'newspaper_id'
    }
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'delivered', 'failed'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'delivery',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Delivery; 