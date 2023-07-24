
const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '20f110', 
  database: 'feedback_app',
};

const pool = mysql.createPool(dbConfig);

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database!');
    connection.release();
  }
});

module.exports = pool;
