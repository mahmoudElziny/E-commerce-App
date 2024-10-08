import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

import { User, Address } from "../../../DB/models/index.js";
import { ErrorHandlerClass } from "../../utils/index.js";
import { sendEmailService } from "../../services/index.js";
import { OAuth2Client } from 'google-auth-library';

/**
 * @api {post} /user/register Register a new User
 */
export const registerUser = async (req, res, next) => {
    const { userName, email, password, gender, age, phone, userType, country, city, postalCode, buildingNumber, floorNumber, addressLabel } = req.body;

    //email check 
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
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

    if (isEmailSent.rejected.length) {
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
        user: newUser, savedAddress
    });

}

/**
 * @api {patch} /user/verify-email Verify user Email
 */
export const verifyEmail = async (req, res, next) => {

    const { userId } = req.query;

    const confirmedUser = await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });

    if (!confirmedUser) {
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
    if ((email || phone) && password) {

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
            process.env.LOGIN_SECRET,
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

export const loginWithGmail = async (req, res, next) => {

    const { idToken } = req.body;

    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        return payload;
    }
    const result = await verify().catch(console.error);

    if (!result.email_verified) {
        return next(new ErrorHandlerClass({ message: "Email not verified", statusCode: 404, position: "at loginWithGmail api" }));
    }

    const user = await User.findOne({ email: result.email, provider: "GOOGLE" });
    if (!user) {
        return next(new ErrorHandlerClass({ message: "Invalid credentials", statusCode: 404, position: "at loginWithGmail api" }));
    }

    const token = jwt.sign({
        _id: user._id,
        email: result.email,
    }, process.env.LOGIN_SECRET, { expiresIn: "1d" });

    user.status = "online";
    await user.save();
    //success response for signIn
    res.status(200).json({ message: "User signed in", result, token });
}

export const signUpWithGmail = async (req, res, next) => {
    const { idToken } = req.body;

    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        return payload;
    }
    const result = await verify().catch(console.error);

    if (!result.email_verified) {
        return next(new ErrorHandlerClass({ message: "Email not verified", statusCode: 404, position: "at loginWithGmail api" }));
    }

    //email check 
    const isEmailExist = await User.findOne({ email: result.email });
    if (isEmailExist) {
        return next(new ErrorHandlerClass({
            message: "Email already exists",
            statusCode: 400,
        }));
    }

    const randomPass = Math.random().toString(36).slice(-8);


    //create user object
    const userObject = new User({
        userName: result.name,
        email: result.email,
        password: bcrypt.hashSync(randomPass, +process.env.SALT_ROUNDS),
        age: 10,
        phone: "01111111111",
        provider: "GOOGLE",
    });

    //save User 
    const newUser = await userObject.save();

    //success response for signUP
    res.status(201).json({ message: "User signed up", user: newUser });
}

export const updateAccount = async (req, res, next) => {
    const user = req.authUser;
    const newData = req.body;

    //find the user by ID and update user data
    const userUpdated = await User.findByIdAndUpdate(user._id, {
        userName: newData.userName ? newData.userName : user.userName,
        email: newData.email ? newData.email : user.email,
        phone: newData.phone ? newData.phone : user.phone,
        age: newData.age ? newData.age : user.age,
        gender: newData.gender ? newData.gender : user.gender,
    }, { new: true });

    if (!userUpdated) {
        return next(new ErrorHandlerClass({ message: "User not found", statusCode: 404, position: "at updateAccount api" }));
    }

    //success response 
    return res.status(202).json({ message: "user updated successfully", data: userUpdated });
}

export const deleteAccount = async (req, res, next) => {
    const { _id } = req.authUser;

    //find the user by ID and soft delete 
    const userDeleted = await User.findByIdAndUpdate(_id, { isMarkedAsDeleted: true }, { new: true });
    if (!userDeleted) {
        return next(new ErrorHandlerClass({ message: "User not found", statusCode: 404, position: "at deleteAccount api" }));
    }

    //success response 
    return res.status(202).json({ message: "user deleted successfully", data: userDeleted });
}

export const getAccount = async (req, res, next) => {
    const { _id } = req.authUser;
    const user = await User.findById(_id);
    if (!user) {
        return next(new ErrorHandlerClass({ message: "User not found", statusCode: 404, position: "at getAccount api" }));
    }

    //success response 
    return res.status(200).json({ message: "user found successfully", data: user });
}

export const updatePassword = async (req, res, next) => {
    const { _id } = req.authUser;
    const { oldPassword, newPassword } = req.body;

    //find user by ID
    const user = await User.findById(_id);

    if (user) {
        //password hashing
        const passCheck = compareSync(oldPassword, user.password);
        if (!passCheck) {
            return next(new ErrorHandlerClass({ message: "Wrong password", statusCode: 400, position: "at updatePassword api" }));
        }

        //hashing the new password
        const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
        //update the new password
        await User.updateOne({ _id }, { password: hashedPassword });
        //success response
        return res.status(202).json({ message: "password updated sucessfully" });
    } else {
        return next(new ErrorHandlerClass({ message: "User not found", statusCode: 404, position: "at updatePassword api" }));
    }
}

export const forgetPassword = async (req, res, next) => {
    const { email } = req.query;

    //find user by email
    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandlerClass({ message: "User not found", statusCode: 404, position: "at forgetPassword api" }));
    }

    //create token for reset password
    const token = jwt.sign(
        {
            email: user.email,
        },
        process.env.RESET_PASSWORD_SECRET,
        {
            expiresIn: "5min",
        }
    );

    //create reset password link
    const resetLink = `${req.protocol}://${req.headers.host}/user/reset-password?token=${token}`;
    //sending email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: "Welcome to E-Commerce App - Reset your Account Password",
        html: `<a href=${resetLink}>Please reset your account password by clicking this link</a>`
    });

    if (isEmailSent.rejected.length) {
        return next(new ErrorHandlerClass({
            message: "Reset Password is failed",
            statusCode: 500,
            position: "at forgetPassword api",
            data: isEmailSent
        }
        ));
    }

    //success response
    res.status(200).json({
        message: "Email sent successfully",
        data: isEmailSent
    });

}

export const resetPassword = async (req, res, next) => {
    const { token } = req.query;
    const { password } = req.body;
    //distruct reset token 
    let decodedData;
    try {
        decodedData = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);

    } catch (error) {
        return next(new ErrorHandlerClass({ message: "Invalid Token payload", statusCode: 400, position: "at forgetPassword api" }));
    }
    //check if the token decoded is right
    if(!decodedData?.email){
        return next( new ErrorHandlerClass({message: "Invalid Token payload", statusCode: 400, position: "at forgetPassword api"}) );     
    }

    //find user by email    
    const user = await User.findOne({ email: decodedData.email });
    if (!user) {
        return next(new ErrorHandlerClass({ message: "User not found", statusCode: 404, position: "at resetPassword api" }));
    }

    //hashing the new password
    const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
    //update the new password
    await User.updateOne({ email: decodedData.email }, { password: hashedPassword });
    //success response
    return res.status(202).json({ message: "password updated sucessfully" });
}
