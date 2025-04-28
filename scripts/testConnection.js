const { initializeDatabase } = require('../config/database');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const db = await initializeDatabase();
        console.log('Database connection successful!');
        
        // Test each model
        const { Owner, Employee, Customer, Newspaper } = require('../models/associations');
        
        console.log('\nTesting Owner model...');
        const owners = await Owner.findAll();
        console.log(`Found ${owners.length} owners`);
        
        console.log('\nTesting Employee model...');
        const employees = await Employee.findAll();
        console.log(`Found ${employees.length} employees`);
        
        console.log('\nTesting Customer model...');
        const customers = await Customer.findAll();
        console.log(`Found ${customers.length} customers`);
        
        console.log('\nTesting Newspaper model...');
        const newspapers = await Newspaper.findAll();
        console.log(`Found ${newspapers.length} newspapers`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testConnection(); 