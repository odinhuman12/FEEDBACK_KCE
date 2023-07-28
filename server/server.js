const express = require("express");
const conn = require("./config/dbConnect")
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

async function getConn(){
    const db = await conn.createConnection();
    console.log("Database connected!")
    return db;
 }

const oneDay = 1000*60*60*24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use(cookieParser());
var session;


app.get("/login",(req,res)=>{

    res.render('stlogin',{message:''});
});

app.post("/auth-student",async(req,res)=>{
    const {username,password} = req.body;
    const db = await getConn();
    try{
    db.query('SELECT rollno,password FROM student_data WHERE rollno = ?',[username],async(err,rs)=>{
        if(err) {
            rs.render('stlogin',{message:'Incorrect UserName or Password'});
        }
        else{
        if(rs.length == 0) res.render("stlogin",{message:"Incorrect User-name or Password"})
        else {
            // console.log(rs);
           if(password == rs[0].password){
            // creating a new session
             session=req.session;
             session.user_id=req.body.username;
            //  console.log(req.session);

            //fetching courses enrolled by the current_user
            const enrolledCourses = await conn.fetchEnrolledCourses(db,rs[0].rollno);
            // console.log(enrolledCourses);
            
            //adding the enrolled courses of the user to the user's session
            req.session.enrolledCourses = enrolledCourses;
            req.session.index = 0;
             res.redirect('/questions/'+req.session.user_id+'/0');
           } 
           else res.render("stlogin",{message:"Incorrect User-name or Password"})
        }
      }
        
    });
    }catch(err){
        console.log(err);
    }
  
});

app.get('/questions/:user_id/:course_index',(req,res)=>{
 try{
    //rendring questions page only if user id exists(i.e, already logged in)
    let user = req.session.user_id;
    const {user_id,course_index} = req.params;
    const currentCourse = req.session.enrolledCourses[course_index];
    // console.log(user);
    
    if(!currentCourse) res.send("Thank you for the feedback");
    else if(user) {
        res.render('questions',{rollno :user,currentCourse});   
    }
    else res.redirect('/login'); //if user not logged in redirect to login page
 }catch(err){
    console.log(err);
 }
    
});

app.post('/rating',(req,res)=>{
  try{
    console.log(req.body);
    const nextIndex = Number(req.session.index)+1;
    req.session.index = nextIndex;
    res.redirect('/questions/'+req.session.user_id+'/'+req.session.index);
  }catch(err){
    console.log(err);
  }
   
})


app.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/login');
});


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





