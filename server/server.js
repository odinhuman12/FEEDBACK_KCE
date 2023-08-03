const express = require("express");
const conn = require("./config/dbConnect")
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const path = require('path');
const app = express(); //instance of express application
const fs = require('fs');
const multer=require('multer');
const csvParser=require('csv-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const json2csv = require('json2csv').Parser;

const upload=multer({dest:'uploads'});

//telling express to serve static files from public folder
app.use(express.static(path.join(__dirname, 'public/images')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

let connectionInstance = null;
async function getConn(){
    return await conn.createConnection(connectionInstance);
 }

 //session lifetime
const oneDay = 1000*60*60*24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use(cookieParser());
var session;
var disableResponses = false;


app.get("/login",(req,res)=>{

    res.render('stlogin',{message:''});
});


//authenticating user
app.post("/auth-student",async(req,res)=>{

    //fetching the username and password given by user
    const {username,password} = req.body;
    const db = await getConn();
   
    try{
        //fetching actual username and password from DB
    db.query('SELECT rollno,dept,name,password,year FROM student_data WHERE rollno = ? LIMIT 1',[username],async(err,rs)=>{
        if(err) {
            //if error render the same login page again
            res.render('stlogin',{message:'Incorrect UserName or Password'});
        }
        else{
            //if length is zero which means user doesn't exists
        if(rs.length == 0) res.render("stlogin",{message:"Incorrect User-name or Password"})
        else if(disableResponses) res.render('stlogin',{message: 'Currently not accepting responses'});
        else {
            // console.log(rs);
           if(password == rs[0].password){
            //If the user is authenticated
            // creating a new session
             session=req.session;

             //creating a new property in the session object and assigning its value as current user name
             session.user_id = req.body.username;
             session.dept = rs[0].dept;
             session.student_name = rs[0].name;  
             let year = rs[0].year;
             let batch = year.substr(-2);
              
             session.batch = batch;

             
            //fetching courses enrolled by the current_user
            const enrolledCourses = await conn.fetchEnrolledCourses(db,rs[0].rollno);
            // console.log(rs);
            // console.log(enrolledCourses);
            
            //adding the enrolled courses of the user to the user's session
            req.session.enrolledCourses = enrolledCourses;

            //setting up an index in the session to keep track of which course's feedback the user is currently filling
            req.session.index = 0;

           
            //redirecting to the questions page with the index of course and user's rollno
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


//renders the questions page for the current course (: means dynamic query parameters)
app.get('/questions/:user_id/:course_index',async(req,res)=>{
 try{
    //rendring questions page only if user id exists(i.e, already logged in)
    let user = req.session.user_id;
    const {user_id,course_index} = req.params;
    const currentCourse = await req.session.enrolledCourses[course_index]; //fetching the data of current course using the index and array of enrolled courses which is already stored in the session
    // console.log(user);
    
    if(!currentCourse){
        const user_data = {
            rollno: user_id,
            dept: req.session.dept,
            sem: req.session.enrolledCourses[0].sem,
            batch: req.session.batch
        }
        res.render('feedback',{user_data}); //if current course is undefined , this means the array of courses came to an end
    }
    else if(user) {
        //splitting the rollno with the alphabet as breakpoint to find out the section of the user.
        const splitted = user.split(/[a-zA-Z]/);
        const checker = splitted[1][0]; //first digit of the rollno.

        const section = (checker == '1' || checker == '5') ? 'A' : (checker == '2' || checker == '6') ? 'B' : 'C';
        const current_user = {
            rollno : user,
            dept : req.session.dept,
            student_name : req.session.student_name,
            section: section,
            batch: req.session.batch
        };
        
        res.render('questions',{user : current_user,currentCourse});    //render the questions page with the current course
    }
    else res.redirect('/login'); //if user not logged in redirect to login page
 }catch(err){
    console.log(err);
    res.redirect('/login');
 }
    
});

//User's feedback for a course
app.post('/rating',async(req,res)=>{
  try{
    const db = await getConn();
    await conn.saveFeedback(db,req.body);
    const nextIndex = Number(req.session.index)+1; //incrementing the old index by 1 so that we can redirect the user with the next course
    req.session.index = nextIndex; //storing the new course index into the session(old value of index will be overwrited)
    res.redirect('/questions/'+req.session.user_id+'/'+req.session.index); //redirecting to the questions page for 'current user' with 'next course'
  }catch(err){
    console.log(err);
  }
});

app.post('/suggestions',async(req,res)=>{
    const db = await getConn();
    await conn.saveSuggestions(db,req.body);
    res.send('Thank you for the feedback')
});



app.get('/logout',(req,res)=>{

    delete req.session.user_id
    delete req.session.dept
    delete req.session.student_name
    delete req.session.batch
    delete req.session.enrolledCourses
    delete req.session.index

    res.redirect('/login');
});


//  -- ADMIN PORTAL --

//admin login
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
           if(password == rs[0].password){
             session = req.session;
             session.admin_id = rs[0].username;
             res.redirect('dashboard');
           }
           else res.render('adlogin',{message:'Incorrect UserName or password'});
        }
        
    });
});

app.get("/dashboard",(req,res)=>{
    admin_id = req.session.admin_id;
    if(admin_id)   res.render('dashboard',{message:' '});
    else res.redirect('/admin');
})


//read excel
app.post('/save',upload.single('csvfile'),(req,res)=>{
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
        console.log(csvData);
         count = await saveData(csvData); //saving the csv data into db
        console.log(count);
        res.render('dashboard',{message:`Uploaded: Rows ${count}`})
      });
    
    }catch(err){
        console.log(err);
        // res.render('dashboard',{message:'Please select a file'})
    }
});

//report
app.get('/report',(req,res)=>{
    admin_id = req.session.admin_id;
    if(admin_id)  res.render('report-query');
    else res.redirect('/admin');
});

app.post('/create-report',async(req,res)=>{
   
    const connection = await getConn();
    
    const report = await conn.getReport(connection,req.body);

    const suggestions = await conn.getSuggestions(connection,req.body);
    

    const cols = ['rollno','dept','sem','suggestion','batch'];
    const parser = new json2csv({cols});
    const csvData = parser.parse(suggestions);

    //writing csv data into a file
    fs.writeFile('reports/suggestions.csv',csvData,(err)=>{
        if(err) console.log(err);
    });
    console.log('csv created');
    //saving the suggestions into a csv and storing it in the reports folder
    const query = {
        dept:req.body.dept,
        sem:req.body.sem,
        batch: req.body.batch
    };
    res.render('final-report',{query,report});
})


async function saveData(csvData){
   
    const connection = await getConn();

    // Call the function to insert the CSV data into MySQL
    const count = await conn.insertCSVData(connection, csvData);
  
    // Close the database connection
    await conn.closeConnection(connection);

    return count;
    
};

app.get('/admin-logout',(req,res)=>{
    if(req.session.admin_id) {
        delete req.session.admin_id;
       res.redirect('/admin');
    }
    else res.redirect('/admin')
})

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});





