const mysql = require('mysql2/promise');
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sofuled',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Successfully connected to database');
  } catch (err) {
    console.error('Error connecting to the database:', err.stack);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function initializeDatabase() {
  try {
    // First test the connection
    await testConnection();

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement + ';');

    // Execute each statement
    for (const statement of statements) {
      await pool.execute(statement);
    }

    winston.info('Database schema initialized successfully');
  } catch (error) {
    winston.error('Error initializing database schema:', error);
    throw error;
  }
}

// Export both the pool and initialization function
module.exports = { pool, initializeDatabase }; 