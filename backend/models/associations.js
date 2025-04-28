const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import models
const Owner = require('./Owner');
const Employee = require('./Employee');
const Customer = require('./Customer');
const Newspaper = require('./Newspaper');
const Subscription = require('./Subscription');
const Payment = require('./Payment');
const Delivery = require('./Delivery');
const Notification = require('./Notification');

// Owner Associations
Owner.hasMany(Employee, { foreignKey: 'owner_id' });
Owner.hasMany(Newspaper, { foreignKey: 'owner_id' });
Owner.hasMany(Notification, { foreignKey: 'owner_id' });

// Employee Associations
Employee.belongsTo(Owner, { foreignKey: 'owner_id' });
Employee.hasMany(Delivery, { foreignKey: 'employee_id' });
Employee.hasMany(Notification, { foreignKey: 'employee_id' });

// Customer Associations
Customer.hasMany(Subscription, { foreignKey: 'customer_id' });
Customer.hasMany(Delivery, { foreignKey: 'customer_id' });

// Newspaper Associations
Newspaper.belongsTo(Owner, { foreignKey: 'owner_id' });
Newspaper.hasMany(Subscription, { foreignKey: 'newspaper_id' });
Newspaper.hasMany(Delivery, { foreignKey: 'newspaper_id' });

// Subscription Associations
Subscription.belongsTo(Customer, { foreignKey: 'customer_id' });
Subscription.belongsTo(Newspaper, { foreignKey: 'newspaper_id' });
Subscription.hasMany(Payment, { foreignKey: 'subscription_id' });

// Payment Associations
Payment.belongsTo(Subscription, { foreignKey: 'subscription_id' });

// Delivery Associations
Delivery.belongsTo(Employee, { foreignKey: 'employee_id' });
Delivery.belongsTo(Customer, { foreignKey: 'customer_id' });
Delivery.belongsTo(Newspaper, { foreignKey: 'newspaper_id' });

// Notification Associations
Notification.belongsTo(Owner, { foreignKey: 'owner_id' });
Notification.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = {
  sequelize,
  Owner,
  Employee,
  Customer,
  Newspaper,
  Subscription,
  Payment,
  Delivery,
  Notification
}; 