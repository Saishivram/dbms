const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Notification = sequelize.define('Notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'owner',
      key: 'owner_id'
    }
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employee',
      key: 'employee_id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notification',
  schema: 'newspaper_supply_chain',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Notification; 