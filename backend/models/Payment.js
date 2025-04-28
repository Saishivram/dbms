const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subscription_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subscription',
      key: 'subscription_id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'late'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'payment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Payment; 