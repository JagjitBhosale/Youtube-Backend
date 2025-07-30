import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import jwt from "jsonwebtoken"; 
import { User } from "../models/user.model.js";

//when we are not using res so "_"
export const verifyJWT = asyncHandler(async(req, _ , next)=>{

  //cookie access from cookieparser
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ",""); //header for mobile when cookies is not there
 
    if(!token)
    {
     throw new ApiError(401,"Unauthorized Request Token not there")
    }
 
    const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
 
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
 
    if (!user) {
       throw new ApiError(401,"Invalid Access Token");
    }
 
    req.user = user;
    next();
  } catch (error) {
   
   throw new ApiError(402,error?.message || "Invalid Access Token");
   
   
  }

   
})