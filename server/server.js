const express = require("express");
const db= require("./config/dbConnect")
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const path = require('path');
const app = express(); //instance of express application
const fs=require('fs');
const multer=require('multer');
const csvParser=require('csv-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');




const upload=multer({dest:'uploads'});


//telling express to serve static files from public folder
app.use(express.static(path.join(__dirname, 'public/images')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));



const oneDay = 1000*60*60*24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}))
app.use(cookieParser());
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
             res.redirect('/questions');
           } 
           else res.render("stlogin",{message:"Incorrect User-name or Password"})
        }
      }
        
    });
    }catch(err){
        console.log(err);
    }
  
});

app.get('/questions',(req,res)=>{
    res.render('questions');
})
console.log("hello");
//admin portal
app.get("/admin",(req,res)=>{
    res.render('adlogin',{message:''});
});

//authenticate admin
app.post("/auth-admin",(req,res)=>{
    const {username,password} = req.body;

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
app.post('/save',upload.single('csvfile'),(req,res)=>{
    console.log('done');
})





app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});





