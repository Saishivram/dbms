'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, rename owner_id to recipient_id
    await queryInterface.renameColumn('notification', 'owner_id', 'recipient_id');

    // Remove employee_id column
    await queryInterface.removeColumn('notification', 'employee_id');

    // Add type column
    await queryInterface.addColumn('notification', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'info'
    });

    // Ensure created_at column exists
    await queryInterface.addColumn('notification', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert all changes
    await queryInterface.renameColumn('notification', 'recipient_id', 'owner_id');
    
    await queryInterface.addColumn('notification', 'employee_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'employee',
        key: 'employee_id'
      }
    });

    await queryInterface.removeColumn('notification', 'type');
  }
}; 