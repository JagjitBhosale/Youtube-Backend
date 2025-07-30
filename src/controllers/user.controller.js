import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const registerUser = asyncHandler(async (req, res) =>{
    // res.status(200).json({
    //     message: "ok",
    //     res: req.params.id
    // })

    //Registering user
    //1 : Get user details from frontend
    //2 : Validation - not empty
    //3 : Check if user already exists: username , email
    //4 : Check for images , Check for avatar
    //5 : Upload them to cloudinary, avatar
    //6: Create user object - create entry in db
    //7 : Remove password and refresh token field from response
    //8 : Check for user creation
    //9 : return response

    //console.log("req.body he ye : ",req.body);
    /*req.body me ye ata he :  [Object: null prototype] {
    fullName: 'Jagjitsssddhmf',
    email: 'jagjit@gmailssxsxt',
    password: '123456',
    username: 'jagjitbbhosalehxssxxschcf'
    }*/



    const {fullName , email ,username, password} = req.body;
    console.log("email: ",email);
    // console.log("password ",password);

    // if(fullName === ""){
    //     throw new ApiError(400,"fullname is required")
    // }


    //Validation - not empty
    if([fullName , email, username,password].some((fields)=>
    fields?.trim() === "")
    ) //if arry element exixts then trim it and compare with empty string
    {
        throw new ApiError(400, "All fields are required")
    }


    //1 : Check if user already exists: username , email
    const existedUser = await User.findOne(
        //findOne finds the first one user
        {
            $or:[{email}, {username}]  //ya to email mil jaye or username
        }
    )

    if(existedUser) //if true
    {
        throw new ApiError(409,"User with email or username exists")
    }


    //4 : Check for images , Check for avatar
    console.log("req.files : ",req.files);
    /*req.files me ye he:  [Object: null prototype] {
    avatar: [
        {
        fieldname: 'avatar',
        originalname: 'Outdoors-man-portrait_(cropped).jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: './public/temp',
        filename: 'Outdoors-man-portrait_(cropped).jpg',
        path: 'public\\temp\\Outdoors-man-portrait_(cropped).jpg',
        size: 532467
        }
    ],
    coverImg: [
        {
        fieldname: 'coverImg',
        originalname: 'final.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: './public/temp',
        filename: 'final.jpg',
        path: 'public\\temp\\final.jpg',
        size: 23110
        }
    ]
    }*/


    const avatarLocalPath = req.files?.avatar?.[0]?.path;         // Path to uploaded avatar file
    const coverImageLocalPath = req.files?.coverImg?.[0]?.path;   // Path to uploaded cover image

    // let coverImageLocalPath;
    // if(req.files?.coverImg && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0)
    // {
    //     coverImageLocalPath = req.files?.coverImg?.[0]?.path || "";
    // }


    if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar not uploaded");
    }



    //5 : Upload them to cloudinary, avatar
    const avatarUploadCloudinaryReturn = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUploadCloudinaryReturn = await uploadOnCloudinary(coverImageLocalPath);
    

    //avatar image is comulsary to upload
    if(!avatarUploadCloudinaryReturn)
    {
         throw new ApiError(409,"Avatar not uploaded")
    }

    //DB User Schema
    // const user = await User.create({
    //     fullName,
    //     avatarUploadCloudinaryReturn: avatarUploadCloudinaryReturn.url,
    //     coverImageUploadCloudinaryReturn: coverImageUploadCloudinaryReturn.url || "",
    //     email,
    //     password,
    //     username : username.toLowerCase()
    // })

    //6: Create user object - create entry in db
    console.log("Incoming fields: ", fullName, email, username, password);
    console.log("Avatar path: ", avatarUploadCloudinaryReturn.url);
    console.log("Cover path: ", coverImageUploadCloudinaryReturn.url);


    // Create a new user document in the MongoDB collection using the Mongoose model
    const user = await User.create({
        fullName,                                 // User's full name
        avatar: avatarUploadCloudinaryReturn.url, // Avatar image URL from Cloudinary upload result
        coverImg: coverImageUploadCloudinaryReturn.url || "", 
        // Cover image URL from Cloudinary (or empty string if not uploaded)
        email,                                    // User's email address
        password,                                 // Hashed password (make sure it's hashed before this step!)
        username: username.toLowerCase()          // Username in lowercase to maintain consistency
    });



    // Fetch the newly created user by ID, but exclude sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"     // Exclude password and refreshToken from the response (kya kyya exclude karna he)
    );


    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    //9 : return response of the created user registered
    console.log(createdUser);
    
    return res.status(201).json(
        new ApiResponse(
            200,                     // Internal status code used in your API response (can differ from HTTP code)
            createdUser,             // Payload: the user object without password and refreshToken
            "User Registered Successfully"  // Message to show on frontend or logs
        )
    );


})




const generateAccessAndRefreshTokens = async (userId)=>{
    try{
     const user = await User.findById(userId);
     const accessToken = user.generateAccessToken();
     const refreshToken = user.generateRefreshToken(); 

        user.refreshToken = refreshToken;
        //DB Operation : Saving refreshToken in DB
        await user.save({ validatBeforeSave: false })

        return {accessToken, refreshToken}
        
    } catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

// Login Controller
const loginUser = asyncHandler(async (req, res) => {
    // Destructure email, username, and password from the request body
    const { email, username, password } = req.body;

    // Step 1: Validate input — either username or email must be provided
    if (!(username || email)) {
        throw new ApiError(400, "Username or Email is required");
    }

    // Step 2: Find user by username OR email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    // If user is not found
    if (!user) {
        throw new ApiError(404, "User not found with this Email or Username");
    }

    // Step 3: Check if entered password matches the stored (hashed) password
    // Custom method defined in user model to compare passwords
    const isPasswordValid = await user.isPassowrdCorrect(password);

    // If password does not match
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password");
    }

    // Step 4: Generate new Access and Refresh Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Step 5: Fetch the updated user object (excluding password and refreshToken)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Step 6: Set cookie options
    const options = {
        httpOnly: true, // Cannot be accessed via client-side JS
        secure: true     // Ensures cookies are sent over HTTPS only
    };

    // Step 7: Send tokens in cookies + send user data in response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)  // Set accessToken cookie
        .cookie("refreshToken", refreshToken, options) // Set refreshToken cookie
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User Logged in Successfully"
            )
        );
});





// Logout Controller
const logoutUser = asyncHandler(async (req, res) => {
    // Step 1: Remove the refreshToken from user's DB record
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined } // Clear the refresh token
        },
        {
            new: true // Return updated user document
        }
    );

    // Step 2: Cookie options
    const options = {
        httpOnly: true,
        secure: true
    };

    // Step 3: Clear cookies on the client
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User Logged out Successfully"
            )
        );
});


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Unotherized Request");
    }

    try {
        const decodedToken  = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user)
        {
            throw new ApiError(101,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"Refresh Token is expired , as it is not same in the DB")
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshTokens(user.id)
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshTokenRefres},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }

    

     

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}