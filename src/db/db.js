import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";  //while importing we write .js otherwise will give error

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB Connected Sucsessfully HOST: 
            ${connectionInstance.connection.host}`)    //Also try to print connectionInstance it will give info about the connection
    } catch (error) {
        console.log("Mongodb connection Failed",error);
        process.exit(1)
        
    }
}

export default connectDB;
