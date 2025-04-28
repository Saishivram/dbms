'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the phone column exists
      const tableDescription = await queryInterface.describeTable('employee');
      if (!tableDescription.phone) {
        await queryInterface.addColumn('employee', 'phone', {
          type: Sequelize.STRING(15),
          allowNull: true,
          defaultValue: null
        });
        console.log('Added phone column to employee table');
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the phone column if it exists
      const tableDescription = await queryInterface.describeTable('employee');
      if (tableDescription.phone) {
        await queryInterface.removeColumn('employee', 'phone');
        console.log('Removed phone column from employee table');
      }
    } catch (error) {
      console.error('Error in migration rollback:', error);
      throw error;
    }
  }
}; 