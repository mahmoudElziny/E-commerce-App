import { hashSync } from "bcrypt";

import {User} from "../../../DB/models/index.js";
import {ErrorHandlerClass} from "../../utils/index.js";

/**
 * @api {post} /user/register Register a new User
 */
export const registerUser = async (req, res, next) => {
    const { userName, email, password, gender, age, phone, userType } = req.body;
    
    //email check 
    const isEmailExist = await User.findOne({ email });
    if(isEmailExist){
        return next(new ErrorHandlerClass({
            message: "Email already exists",
            statusCode: 400,
        }))
    }

    //send email verification link

    //create user object
    const userObject = new User({
        userName,
        email,
        password,
        gender,
        age,
        phone,
        userType,
    });

    //create the user in db 
    const newUser = await userObject.save();

    //success response
    res.status(201).json({
        message: "User created successfully",
        data: newUser
    });

} 