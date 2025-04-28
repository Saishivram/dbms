const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Connected to database. Checking tables...');

    // Check owners table
    const [owners] = await connection.execute('SELECT * FROM owner');
    console.log('\nOwners table:');
    console.log(owners);

    // Check employees table
    const [employees] = await connection.execute('SELECT * FROM employee');
    console.log('\nEmployees table:');
    console.log(employees);

    // Check customers table
    const [customers] = await connection.execute('SELECT * FROM customer');
    console.log('\nCustomers table:');
    console.log(customers);

    // Check newspapers table
    const [newspapers] = await connection.execute('SELECT * FROM newspaper');
    console.log('\nNewspapers table:');
    console.log(newspapers);

    // Check subscriptions table
    const [subscriptions] = await connection.execute('SELECT * FROM subscription');
    console.log('\nSubscriptions table:');
    console.log(subscriptions);

    // Check payments table
    const [payments] = await connection.execute('SELECT * FROM payment');
    console.log('\nPayments table:');
    console.log(payments);

    // Check deliveries table
    const [deliveries] = await connection.execute('SELECT * FROM delivery');
    console.log('\nDeliveries table:');
    console.log(deliveries);

    console.log('\nDatabase check completed.');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await connection.end();
  }
}

checkDatabase(); 