const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');

const Employee = sequelize.define('Employee', {
  employee_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'owner',
      key: 'owner_id'
    }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'delivery'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'employee',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: async (employee) => {
      if (employee.password) {
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(employee.password, salt);
      }
    },
    beforeUpdate: async (employee) => {
      if (employee.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(employee.password, salt);
      }
    }
  }
});

// Instance method to compare password
Employee.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Employee; 