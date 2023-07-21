//connecting to mysql database
const mysql = require("mysql");


const connectDB = () =>{
    try{
        //configuration
        const con = mysql.createConnection({
            host:"localhost",
            user:"root",
            password:process.env.MYSQL_PASSWORD,
            database:"feedback_app"
        });

        //connecting to db
        con.connect((err)=>{
            if(err){
                console.log("Error in connection");
                console.log(err);
            }
            else{
                //executing query
                const query = "SHOW TABLES";
                con.query(query,(err,res)=>{
                    if(err){
                        console.log("Error in query");
                        console.log(err);
                    } 
                    else console.log(res);
                })
            }
        })
       
    }catch(err){
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;
