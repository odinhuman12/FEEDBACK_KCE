const express = require("express");
const conn = require("./config/dbConnect")
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const path = require('path');
const app = express(); //instance of express application
const fs = require('fs');
const multer = require('multer');
const csvParser = require('csv-parser');


async function getConn(){
   const db = await conn.createConnection();
   console.log("Database connected!")
   return db;
}
const upload=multer({dest:'uploads/'}); //specifying the destination folder


//telling express to serve static files from public folder
app.use(express.static(path.join(__dirname, 'public/images')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/login",(req,res)=>{
    res.render('stlogin',{message:''});
});

app.post("/auth-student",async(req,res)=>{
    const {username,password} = req.body;
    const db = await getConn();
    db.query('SELECT * FROM auth WHERE username = ?',[username],(err,res)=>{
        if(err) console.log(err);
        
        if(res.length == 0) console.log("User doesn't exists");
        else {
           if(password == res[0].password) res.render("incorrect pass")
           else console.log("Correct password");
        }
        
    });
    res.send("Request received");
});

//admin portal
app.get("/admin",(req,res)=>{
    res.render('adlogin',{message:''});
});

//authenticate admin
app.post("/auth-admin",async(req,res)=>{
    const {username,password} = req.body;
    const db = await getConn();
    db.query('SELECT * FROM auth WHERE username = ?',[username],(err,rs)=>{
        if(err) console.log(err);
        
        if(rs.length == 0) res.render('adlogin',{message:'Incorrect UserName or password'});
        else {
           if(password == rs[0].password) res.render('dashboard',{message:' '});
           else res.render('adlogin',{message:'Incorrect UserName or password'});
        }
        
    });
});


//read excel
app.post('/save',upload.single('csvfile'),async(req,res)=>{
   
    //parsing the csv
    const csvData = []
    try{
    fs.createReadStream(req.file.path) //creating a stream
      .pipe(csvParser()) //piping that stream
      .on('data',(data)=>{ //reading data one by one
        csvData.push(data);
      })
      .on('end',async ()=>{ //at the end of file print the data
        // console.log(csvData);
        await saveData(csvData);
      });
    res.render('dashboard',{message:'uploaded'})
    }catch(err){
        res.render('dashboard',{message:'Please select a file'})
    }
});



async function saveData(csvData){
   
    const connection = await getConn();

    // Call the function to insert the CSV data into MySQL
    await conn.insertCSVData(connection, csvData);
  
    // Close the database connection
    await conn.closeConnection(connection);
    console.log("Values insertion successfull");


}


app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});





