const express = require("express");
const db= require("./config/dbConnect")
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const path = require('path');
const app = express(); //instance of express application

//telling express to serve static files from public folder
app.use(express.static(path.join(__dirname, 'public/images')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/login",(req,res)=>{
    res.render('stlogin',{message:''});
});

app.post("/auth-student",(req,res)=>{
    const {username,password} = req.body;
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






app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});


//utilities

const userExists = (username) =>{
    console.log("inside fn");
    db.query(`SELECT username FROM auth WHERE username = '${username}'`,(err,res)=>{

        if(err) console.log(err);
        else{
            if(res.length == 0) return false; //user doesn't exists
            else return true;;
        }
    })
};



