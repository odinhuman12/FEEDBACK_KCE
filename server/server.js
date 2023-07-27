const express = require("express");
const conn = require("./config/dbConnect")
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const path = require('path');
const app = express(); //instance of express application
const fs = require('fs');
const multer = require('multer');
const csvParser = require('csv-parser');


// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

// //session middleware
// app.use(sessions({
//     secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
//     saveUninitialized:true,
//     cookie: { maxAge: oneDay },
//     resave: false
// }));

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
// cookie parser middleware
// app.use(cookieParser());
var session;



app.get("/login",(req,res)=>{
    res.render('stlogin',{message:''});
});

app.post("/auth-student",async(req,res)=>{
    const {username,password} = req.body;
    const db = await getConn();
    try{
    db.query('SELECT rollno,password FROM student_data WHERE rollno = ?',[username],(err,rs)=>{
        if(err) {
            rs.render('stlogin',{message:'Incorrect UserName or Password'});
        }
        else{
        if(rs.length == 0) res.render("stlogin",{message:"Incorrect User-name or Password"})
        else {
           if(password == rs[0].password){
            //creating a new session
            //  session=req.session;
            //  session.userid=req.body.username;
            //  console.log(req.session);
             res.render('questions');
           } 
           else res.render("stlogin",{message:"Incorrect User-name or Password"})
        }
      }
        
    });
    }catch(err){
        console.log(err);
    }
  
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
    let count = 0;
    try{
    fs.createReadStream(req.file.path) //creating a stream
      .pipe(csvParser()) //piping that stream
      .on('data',(data)=>{ //reading data one by one
        csvData.push(data);
      })
      .on('end',async ()=>{ //at the end of file print the data
        // console.log(csvData);
         count = await saveData(csvData);
        console.log(count);
        res.render('dashboard',{message:`Uploaded: Rows ${count}`})
      });
    
    }catch(err){
        console.log("heree");
        res.render('dashboard',{message:'Please select a file'})
    }
});



async function saveData(csvData){
   
    const connection = await getConn();

    // Call the function to insert the CSV data into MySQL
    const count = await conn.insertCSVData(connection, csvData);
  
    // Close the database connection
    await conn.closeConnection(connection);

        console.log("Values insertion successfull");
    return count;



}


app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});





