const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');

const Owner = sequelize.define('Owner', {
  owner_id: {
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
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'owner',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: async (owner) => {
      if (owner.password) {
        const salt = await bcrypt.genSalt(10);
        owner.password = await bcrypt.hash(owner.password, salt);
      }
    },
    beforeUpdate: async (owner) => {
      if (owner.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        owner.password = await bcrypt.hash(owner.password, salt);
      }
    }
  }
});

// Instance method to compare password
Owner.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Owner; 