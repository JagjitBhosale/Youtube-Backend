import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,  //make it searchable , make i fast
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,  //Cloudinary Url
            required: true,
        },
        coverImagee: {
            type: String, //Cloudinary url
        },
        watchHistory: [
            {
                type :  Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true,'Password is required']
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function(next) {
    // if(this.isModified("password"))
    // {
    //     this.password = bcrypt.hash(this.password , 10);
    //     next();
    // }

    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password , 10);
    next();
    
})


userSchema.methods.isPassowrdCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

//Usecase of the above method
// const user = await User.findOne({ email: "jagjeet@gmail.com" });

// // user.password === hashed password from DB

// const isMatch = await user.isPassowrdCorrect("enteredPassword");



// jwt.sign(payload, secret, options)
// Payload = info you want to put inside the token (e.g., user ID)

// Secret = secret key to sign the token (from .env)

// Options = like token expiry time
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            //less information , we just keep id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)