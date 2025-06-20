//we need to connect the database firstly so we are doing so when the server runs

//require('dotenv').config({path:'./env'})  // directly chalega but uneven he nihe import
//instead we write
import dotenv, { config } from 'dotenv';

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/db.js";  ///error while importing ,so we writted db.js

//instead but need to make changes in dev in package.json
//dev :"nodemon -r dotenv/config --experimental-json-modules src/index.js"
dotenv.config({
    path:'./env'
})


import app from "./app.js"
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port :${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed", err);
    
})




















/*
Approach 1
import express from "express";
const app = express();
// function connectDB(){
// }
;(async ()=>{
 try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error",(error)=>{
        console.log(error);
        throw error;
    })

    app.listen(process.env.PORT , ()=>{
        console.log(`App is listening on the Port ${process.env.PORT}`);
    })

 } catch (error) {
    console.log("Error",error)
 }
})()
*/