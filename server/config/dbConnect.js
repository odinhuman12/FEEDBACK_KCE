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


//inserting csv into mysql
async function insertCSVData(connection, csvData) {
  let count = 0;
  try {
    let cols = Object.keys(csvData[0]).join(' VARCHAR(100), ');
    cols = cols.concat(" VARCHAR(100) ");
    // console.log(cols);

    //dropping the old table
    await new Promise((resolve,reject)=>{
      connection.query('DROP TABLE IF EXISTS student_data',(err,rs)=>{
        if(err) reject(err);
        else resolve(rs);
      });
    });

    //creating table
    await new Promise((resolve,reject)=>{
      connection.query(`CREATE TABLE student_data(${cols})`,(err,rs)=>{
        if(err) reject(err);
        else{
          // console.log(rs);
          resolve(rs);
        } 
      });
    });
    console.log("Table created");


    // Prepare the INSERT query with placeholders
    const columns = Object.keys(csvData[0]).join(', ');
    const valuesPlaceholders = csvData[0] ? csvData[0] : {};
    const placeholders = Object.keys(valuesPlaceholders).map(() => '?').join(', ');
    // console.log(columns);
    // console.log(placeholders);
    const insertQuery = `INSERT INTO student_data (${columns}) VALUES (${placeholders})`;
    
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
    count++;
  }

    console.log('CSV data inserted into MySQL table successfully.');
  } catch (error) {
    console.error('Error inserting CSV data into MySQL:', error);
  }
  return count;
}


//fetching all the enrolled courses of a particular user
async function fetchEnrolledCourses(connection,rollno){
  await new Promise((resolve,reject)=>{
    connection.query('SELECT ')
  });
}
module.exports = {
  createConnection,
  closeConnection,
  insertCSVData,
};