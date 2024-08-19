import {compareSync} from "bcrypt";
import jwt from "jsonwebtoken";

import {User, Address} from "../../../DB/models/index.js";
import {ErrorHandlerClass} from "../../utils/index.js";
import {sendEmailService} from "../../services/index.js";

/**
 * @api {post} /user/register Register a new User
 */
export const registerUser = async (req, res, next) => {
    const { userName, email, password, gender, age, phone, userType, country, city, postalCode, buildingNumber, floorNumber, addressLabel } = req.body;
    
    //email check 
    const isEmailExist = await User.findOne({ email });
    if(isEmailExist){
        return next(new ErrorHandlerClass({
            message: "Email already exists",
            statusCode: 400,
        }))
    }
    

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
    
const addressInstance = new Address({
    userId: userObject._id, country, city, postalCode, buildingNumber, floorNumber, addressLabel, isDefault: true,
});

    //send email verification link
    //generate email confirmation Link 
    const confirmationLink = `${req.protocol}://${req.headers.host}/user/verify-email?userId=${userObject._id}`;
    //sending email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: "Welcome to E-Commerce App - verify your email address",
        html: `<a href=${confirmationLink}>Please verify your email address by clicking this link</a>`
    });

    if(isEmailSent.rejected.length){
        return next(new ErrorHandlerClass({
        message: "Verification Email is failed",
        statusCode: 500,
        position: "at registration api",
        data: isEmailSent
    }
    ));
    }

    //create the user in db 
    const newUser = await userObject.save();
    const savedAddress = await addressInstance.save();

    //success response
    res.status(201).json({
        message: "User created successfully",
        user: newUser , savedAddress
    });

} 

/**
 * @api {patch} /user/verify-email Verify user Email
 */
export const verifyEmail = async (req, res, next) => {

    const { userId } = req.query;

    const confirmedUser = await User.findByIdAndUpdate( userId, { isEmailVerified: true } , {new: true});
    
    if(!confirmedUser){
        return next(new ErrorHandlerClass({ message: "User not found", statusCode: 404, position: "at verifyEmail api" }));
    }

    res.status(200).json({
        message: "User verified successfully",
        data: confirmedUser,
    });
} 

/**
 * @api {patch} /user/signIn SignIn a User
 */
export const signIn = async (req, res, next) => {
    //distructing user signIn data from body
    const { email, phone, password } = req.body;

    //check if user signning in data exists
    if ((email || phone ) && password) {

        //finding the user and update his status
        const user = await User.findOneAndUpdate({ $or: [{ email }, { phone }] }, { status: 'online' }, { new: true });

        //if user not found 
        if (!user) {
            return next(new ErrorHandlerClass({ message: "Invalid login credentials", statusCode: 404, position: "at SignIn api" }));
        }

        //password hashing
        const passCheck = compareSync(password, user.password);

        //check the password 
        if (!passCheck) {
            return next(new ErrorHandlerClass({ message: "Invalid login credentials, password wrong", statusCode: 404, position: "at signIn api" }));
        }

        //create user token with signuture & expiration date
        const token = jwt.sign(
            {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                userType: user.userType,
                age: user.age,
                gender: user.gender,
                status: user.status,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isMarkedAsDeleted: user.isMarkedAsDeleted
            },
            "accessToken",
            {
                expiresIn: "20d"
            }
        );

        //success response for signIn
        res.status(200).json({ message: "User signed in", token });

    } else {
        return next(new ErrorHandlerClass({ message: "Initialize All Fields", statusCode: 400, position: "at signIn api" }));
    }
}
// TODO Update account
// TODO Delete account
// TODO Get account data for loggedIn user
// TODO 6. Update password
   // - Make the sent URL is one access time (  if you apply it with a reset password link not OTP )
//TODO Update all previues phases depended on User model creation   