// Importing 'mongoose' and 'Schema' from mongoose package
import mongoose, { Schema } from "mongoose";

// Defining the schema for a Subscription
const subscriptionSchme = new Schema({

    // 'subscriber' is a reference to another MongoDB document (from the 'User' model)
    subscriber: {
        type: Schema.Types.ObjectId,  // Storing the ObjectId of the user who subscribed
        ref: "User"                   // Reference to the 'User' collection (model name must match)
    },
    channel: {
       type: Schema.Types.ObjectId,  
       ref: "User"
    }

    
},{timestamps:true});

// Exporting the model so you can use it elsewhere in your app
export const Subscription = mongoose.model("Subscription", subscriptionSchme);
// This creates a MongoDB collection named 'subscriptions' (plural form of 'Subscription')
