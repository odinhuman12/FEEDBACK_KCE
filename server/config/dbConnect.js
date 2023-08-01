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
    const placeholders = Object.keys(valuesPlaceholders).map(() => '?').join(', '); //map()=>'?' will replace the string into '?'
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
  let enrolledCourses = [];
  await new Promise((resolve,reject)=>{
    connection.query('SELECT coursecode,coursename,sem,facultyName FROM student_data WHERE rollno=?',[rollno],(err,rs)=>{
      if(err) reject(err);
      else{
        enrolledCourses = rs;
        resolve();
      }
    })
  });
  return enrolledCourses;
};


async function saveFeedback(connection,user_data){
  try{
    //splitting the json into colums and its values
    let cols = Object.keys(user_data).join(', ');
  // console.log(cols);

   let placeholders = Object.keys(user_data).map(()=> '?').join(', ');
  //  console.log(placeholders);
   let values = Object.values(user_data);
   
   const query = `INSERT INTO kce_course_feedback (${cols}) VALUES (${placeholders})`;
  //  console.log(query);

  //inserting data into db
  await new Promise((resolve,reject) =>{
    connection.query(query,values,(err,rs)=>{
      if(err) reject(err);
      else{
        resolve(rs);
      }
    })
  });
  console.log("Feedback data inserted!");
  } catch(err){
    console.log(err);
    console.log("Error occured");
  }
}

//report of feedback
async function getReport(conn,constraints){
   const dept = constraints.dept;
   const sem = constraints.sem;
   const batch = constraints.batch;

   const query = `
   SELECT
   sub_code,
   sub_name,
   COUNT(CASE WHEN q1 = 1 THEN 1 END) AS count_q1_1,
   COUNT(CASE WHEN q1 = 2 THEN 1 END) AS count_q1_2,
   COUNT(CASE WHEN q1 = 3 THEN 1 END) AS count_q1_3,
   COUNT(CASE WHEN q1 = 4 THEN 1 END) AS count_q1_4,
   COUNT(CASE WHEN q1 = 5 THEN 1 END) AS count_q1_5,
 
   COUNT(CASE WHEN q2 = 1 THEN 1 END) AS count_q2_1,
   COUNT(CASE WHEN q2 = 2 THEN 1 END) AS count_q2_2,
   COUNT(CASE WHEN q2 = 3 THEN 1 END) AS count_q2_3,
   COUNT(CASE WHEN q2 = 4 THEN 1 END) AS count_q2_4,
   COUNT(CASE WHEN q2 = 5 THEN 1 END) AS count_q2_5,
 
   COUNT(CASE WHEN q3 = 1 THEN 1 END) AS count_q3_1,
   COUNT(CASE WHEN q3 = 2 THEN 1 END) AS count_q3_2,
   COUNT(CASE WHEN q3 = 3 THEN 1 END) AS count_q3_3,
   COUNT(CASE WHEN q3 = 4 THEN 1 END) AS count_q3_4,
   COUNT(CASE WHEN q3 = 5 THEN 1 END) AS count_q3_5,
 
   COUNT(CASE WHEN q4 = 1 THEN 1 END) AS count_q4_1,
   COUNT(CASE WHEN q4 = 2 THEN 1 END) AS count_q4_2,
   COUNT(CASE WHEN q4 = 3 THEN 1 END) AS count_q4_3,
   COUNT(CASE WHEN q4 = 4 THEN 1 END) AS count_q4_4,
   COUNT(CASE WHEN q4 = 5 THEN 1 END) AS count_q4_5,
   
   COUNT(CASE WHEN q5 = 1 THEN 1 END) AS count_q5_1,
   COUNT(CASE WHEN q5 = 2 THEN 1 END) AS count_q5_2,
   COUNT(CASE WHEN q5 = 3 THEN 1 END) AS count_q5_3,
   COUNT(CASE WHEN q5 = 4 THEN 1 END) AS count_q5_4,
   COUNT(CASE WHEN q5 = 5 THEN 1 END) AS count_q5_5,
 
   COUNT(CASE WHEN q6 = 1 THEN 1 END) AS count_q6_1,
   COUNT(CASE WHEN q6 = 2 THEN 1 END) AS count_q6_2,
   COUNT(CASE WHEN q6 = 3 THEN 1 END) AS count_q6_3,
   COUNT(CASE WHEN q6 = 4 THEN 1 END) AS count_q6_4,
   COUNT(CASE WHEN q6 = 5 THEN 1 END) AS count_q6_5,
 
   COUNT(CASE WHEN q7 = 1 THEN 1 END) AS count_q7_1,
   COUNT(CASE WHEN q7 = 2 THEN 1 END) AS count_q7_2,
   COUNT(CASE WHEN q7 = 3 THEN 1 END) AS count_q7_3,
   COUNT(CASE WHEN q7 = 4 THEN 1 END) AS count_q7_4,
   COUNT(CASE WHEN q7 = 5 THEN 1 END) AS count_q7_5,
  
   COUNT(CASE WHEN q8 = 1 THEN 1 END) AS count_q8_1,
   COUNT(CASE WHEN q8 = 2 THEN 1 END) AS count_q8_2,
   COUNT(CASE WHEN q8 = 3 THEN 1 END) AS count_q8_3,
   COUNT(CASE WHEN q8 = 4 THEN 1 END) AS count_q8_4,
   COUNT(CASE WHEN q8 = 5 THEN 1 END) AS count_q8_5,
   
   COUNT(CASE WHEN q9 = 1 THEN 1 END) AS count_q9_1,
   COUNT(CASE WHEN q9 = 2 THEN 1 END) AS count_q9_2,
   COUNT(CASE WHEN q9 = 3 THEN 1 END) AS count_q9_3,
   COUNT(CASE WHEN q9 = 4 THEN 1 END) AS count_q9_4,
   COUNT(CASE WHEN q9 = 5 THEN 1 END) AS count_q9_5,
 
   COUNT(CASE WHEN q10 = 1 THEN 1 END) AS count_q10_1,
   COUNT(CASE WHEN q10 = 2 THEN 1 END) AS count_q10_2,
   COUNT(CASE WHEN q10 = 3 THEN 1 END) AS count_q10_3,
   COUNT(CASE WHEN q10 = 4 THEN 1 END) AS count_q10_4,
   COUNT(CASE WHEN q10 = 5 THEN 1 END) AS count_q10_5,
 
   COUNT(CASE WHEN q11 = 1 THEN 1 END) AS count_q11_1,
   COUNT(CASE WHEN q11 = 2 THEN 1 END) AS count_q11_2,
   COUNT(CASE WHEN q11 = 3 THEN 1 END) AS count_q11_3,
   COUNT(CASE WHEN q11 = 4 THEN 1 END) AS count_q11_4,
   COUNT(CASE WHEN q11 = 5 THEN 1 END) AS count_q11_5,
 
   COUNT(CASE WHEN q12 = 1 THEN 1 END) AS count_q12_1,
   COUNT(CASE WHEN q12 = 2 THEN 1 END) AS count_q12_2,
   COUNT(CASE WHEN q12 = 3 THEN 1 END) AS count_q12_3,
   COUNT(CASE WHEN q12 = 4 THEN 1 END) AS count_q12_4,
   COUNT(CASE WHEN q12 = 5 THEN 1 END) AS count_q12_5,
 
   COUNT(CASE WHEN q13 = 1 THEN 1 END) AS count_q13_1,
   COUNT(CASE WHEN q13 = 2 THEN 1 END) AS count_q13_2,
   COUNT(CASE WHEN q13 = 3 THEN 1 END) AS count_q13_3,
   COUNT(CASE WHEN q13 = 4 THEN 1 END) AS count_q13_4,
   COUNT(CASE WHEN q13 = 5 THEN 1 END) AS count_q13_5,
 
   COUNT(CASE WHEN q14 = 1 THEN 1 END) AS count_q14_1,
   COUNT(CASE WHEN q14 = 2 THEN 1 END) AS count_q14_2,
   COUNT(CASE WHEN q14 = 3 THEN 1 END) AS count_q14_3,
   COUNT(CASE WHEN q14 = 4 THEN 1 END) AS count_q14_4,
   COUNT(CASE WHEN q14 = 5 THEN 1 END) AS count_q14_5,
 
   COUNT(CASE WHEN q15 = 1 THEN 1 END) AS count_q15_1,
   COUNT(CASE WHEN q15 = 2 THEN 1 END) AS count_q15_2,
   COUNT(CASE WHEN q15 = 3 THEN 1 END) AS count_q15_3,
   COUNT(CASE WHEN q15 = 4 THEN 1 END) AS count_q15_4,
   COUNT(CASE WHEN q15 = 5 THEN 1 END) AS count_q15_5,
 
   COUNT(CASE WHEN q16 = 1 THEN 1 END) AS count_q16_1,
   COUNT(CASE WHEN q16 = 2 THEN 1 END) AS count_q16_2,
   COUNT(CASE WHEN q16 = 3 THEN 1 END) AS count_q16_3,
   COUNT(CASE WHEN q16 = 4 THEN 1 END) AS count_q16_4,
   COUNT(CASE WHEN q16 = 5 THEN 1 END) AS count_q16_5,
 
   COUNT(CASE WHEN q17 = 1 THEN 1 END) AS count_q17_1,
   COUNT(CASE WHEN q17 = 2 THEN 1 END) AS count_q17_2,
   COUNT(CASE WHEN q17 = 3 THEN 1 END) AS count_q17_3,
   COUNT(CASE WHEN q17 = 4 THEN 1 END) AS count_q17_4,
   COUNT(CASE WHEN q17 = 5 THEN 1 END) AS count_q17_5,
 
 
   COUNT(CASE WHEN q18 = 1 THEN 1 END) AS count_q18_1,
   COUNT(CASE WHEN q18 = 2 THEN 1 END) AS count_q18_2,
   COUNT(CASE WHEN q18 = 3 THEN 1 END) AS count_q18_3,
   COUNT(CASE WHEN q18 = 4 THEN 1 END) AS count_q18_4,
   COUNT(CASE WHEN q18 = 5 THEN 1 END) AS count_q18_5
 
 FROM
   kce_course_feedback
 WHERE
   dept = ?
   AND batch = ?
   AND sem_no = ?
 GROUP BY
   sub_code, sub_name;
   `;
  let report;
   await new Promise((resolve,reject)=>{
    conn.query(query,[dept,batch,sem],(err,rs)=>{
      if(err) reject(err);
      else{
        report = rs;
        resolve(rs);
      }
    })
   });
   return report;
}




module.exports = {
  createConnection,
  closeConnection,
  insertCSVData,
  fetchEnrolledCourses,
  saveFeedback,
  getReport
};