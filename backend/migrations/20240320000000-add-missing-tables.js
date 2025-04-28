'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check and create owners table if it doesn't exist
    const ownersTable = await queryInterface.describeTable('owners');
    if (!ownersTable) {
      await queryInterface.createTable('owners', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }

    // Check and create employees table if it doesn't exist
    const employeesTable = await queryInterface.describeTable('employees');
    if (!employeesTable) {
      await queryInterface.createTable('employees', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        owner_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'owners',
            key: 'id'
          }
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }

    // Check and create customers table if it doesn't exist
    const customersTable = await queryInterface.describeTable('customers');
    if (!customersTable) {
      await queryInterface.createTable('customers', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false
        },
        owner_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'owners',
            key: 'id'
          }
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }

    // Check and create newspapers table if it doesn't exist
    const newspapersTable = await queryInterface.describeTable('newspapers');
    if (!newspapersTable) {
      await queryInterface.createTable('newspapers', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        buying_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        selling_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        owner_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'owners',
            key: 'id'
          }
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }

    // Check and create subscriptions table if it doesn't exist
    const subscriptionsTable = await queryInterface.describeTable('subscriptions');
    if (!subscriptionsTable) {
      await queryInterface.createTable('subscriptions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        customer_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'customers',
            key: 'id'
          }
        },
        newspaper_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'newspapers',
            key: 'id'
          }
        },
        status: {
          type: Sequelize.ENUM('active', 'suspended', 'cancelled'),
          allowNull: false,
          defaultValue: 'active'
        },
        monthly_fee: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        next_payment_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }

    // Check and create payments table if it doesn't exist
    const paymentsTable = await queryInterface.describeTable('payments');
    if (!paymentsTable) {
      await queryInterface.createTable('payments', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        subscription_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'subscriptions',
            key: 'id'
          }
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        payment_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        due_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('paid', 'late'),
          allowNull: false,
          defaultValue: 'paid'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }

    // Check and create deliveries table if it doesn't exist
    const deliveriesTable = await queryInterface.describeTable('deliveries');
    if (!deliveriesTable) {
      await queryInterface.createTable('deliveries', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        employee_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'employees',
            key: 'id'
          }
        },
        customer_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'customers',
            key: 'id'
          }
        },
        newspaper_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'newspapers',
            key: 'id'
          }
        },
        delivery_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        status: {
          type: Sequelize.ENUM('pending', 'delivered', 'failed'),
          allowNull: false,
          defaultValue: 'pending'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }

    // Check and create notifications table if it doesn't exist
    const notificationsTable = await queryInterface.describeTable('notifications');
    if (!notificationsTable) {
      await queryInterface.createTable('notifications', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        user_type: {
          type: Sequelize.ENUM('owner', 'employee', 'customer'),
          allowNull: false
        },
        message: {
          type: Sequelize.STRING,
          allowNull: false
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // We won't implement the down migration since we're working with an existing database
    console.log('Skipping down migration for existing database');
  }
}; 