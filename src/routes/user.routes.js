import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAccessToken, changeCurrentPassword, getCurrentUser} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    // Middleware to handle multipart/form-data (files)
    upload.fields([
        {
            name: "avatar",     // Field name for avatar
            maxCount: 1         // Accept only one file for avatar
        },
        {
            name: "coverImg",   // Field name for cover image
            maxCount: 1         // Accept only one file for cover image
        }
    ]),
    registerUser               // Controller to handle user registration logic
);

//router.route("/login").post(login)



//Login Routes
router.route("/login").post(loginUser)

//Secured Route : Contains Valid Refresh and Access Token

router.route("/logout").post(verifyJWT,/*Another Middleware with next() at the end ,*/ logoutUser)

//Refresh the refresh token
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-pass").post(verifyJWT ,changeCurrentPassword);

router.route("/getCurrentUser").post(verifyJWT ,getCurrentUser);


export default router;