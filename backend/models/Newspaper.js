const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Newspaper = sequelize.define('Newspaper', {
  newspaper_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  frequency: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    references: {
      model: 'owner',
      key: 'owner_id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'newspaper',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: (newspaper) => {
      // Set title to name if not provided
      if (!newspaper.title) {
        newspaper.title = newspaper.name;
      }
      // Set default values for publisher and frequency if not provided
      if (!newspaper.publisher) {
        newspaper.publisher = 'Unknown';
      }
      if (!newspaper.frequency) {
        newspaper.frequency = 'Daily';
      }
    }
  }
});

// Add logging to debug queries
Newspaper.addHook('beforeFind', (options) => {
  console.log('Executing find query with options:', JSON.stringify(options, null, 2));
});

Newspaper.addHook('afterFind', (results) => {
  console.log('Find query results:', JSON.stringify(results, null, 2));
});

module.exports = Newspaper; 