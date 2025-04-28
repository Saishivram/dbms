const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Subscription = sequelize.define('Subscription', {
  subscription_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'cancelled'),
    defaultValue: 'active'
  },
  monthly_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  next_payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'subscription',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Subscription; 