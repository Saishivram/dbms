const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function updateSchema() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Database ${process.env.DB_NAME} ensured`);

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Read and execute schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');

        // Split the schema into individual statements
        const statements = schema.split(';').filter(stmt => stmt.trim());

        // Execute each statement
        for (let statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                    console.log('Executed statement successfully');
                } catch (error) {
                    console.error('Error executing statement:', error);
                    console.error('Statement:', statement);
                }
            }
        }

        console.log('Schema update completed');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema(); 