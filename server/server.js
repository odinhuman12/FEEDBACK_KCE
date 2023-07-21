const express = require("express");
const connectDb = require("./config/dbConnect")
const dotenv = require("dotenv").config();
const app = express(); //instance of express application



connectDb();
app.get("/",(req,res)=>{
    console.log(req);
    res.send("Home page");
})

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});
