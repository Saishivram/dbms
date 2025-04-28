'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Employees', 'phone', {
      type: Sequelize.STRING(15),
      allowNull: false,
      defaultValue: '' // Temporary default value for existing records
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Employees', 'phone');
  }
}; 