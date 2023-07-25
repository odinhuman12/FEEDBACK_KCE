const mysql = require('mysql2');


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Mysql26!', 
  database: 'feedback_app',
};
async function createConnection() {
  const connection = mysql.createConnection(dbConfig);
  return connection;
}

// Function to close the MySQL database connection
async function closeConnection(connection) {
  await connection.end();
}



async function insertCSVData(connection, csvData) {
  try {
    // Prepare the INSERT query with placeholders
    const columns = Object.keys(csvData[0]).join(', ');
    const valuesPlaceholders = csvData[0] ? csvData[0] : {};
    const placeholders = Object.keys(valuesPlaceholders).map(() => '?').join(', ');
    // console.log(columns);
    // console.log(placeholders);
    const insertQuery = `INSERT INTO test (${columns}) VALUES (${placeholders})`;

  for (const row of csvData) {
      const values = Object.values(row);
    // Insert the data into the MySQL table using the prepared INSERT query
    await new Promise((resolve, reject) => {
      connection.query(insertQuery, values , (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

    console.log('CSV data inserted into MySQL table successfully.');
  } catch (error) {
    console.error('Error inserting CSV data into MySQL:', error);
  }
}

module.exports = {
  createConnection,
  closeConnection,
  insertCSVData,
};
