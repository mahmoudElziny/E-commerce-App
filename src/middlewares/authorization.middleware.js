import { ErrorHandlerClass } from "../utils/index.js";


/**
 * authorization middleware
 * @param {object} allowedRoles 
 * @returns {Function}
 * @description check if the user authorized and next to the next middleware otherwise passes data to errorhandler API
 */
export const authorization = (allowedRoles) => {
    return async (req, res, next) => {

        //distruct user from request
        const user = req.authUser;
        
        //check if authorized or not
        if(!allowedRoles.includes(user.userType)){
            return next( new ErrorHandlerClass({
                message: "Authorization Error, You are not allowed to access this route",
                statusCode: 401,
                position: "at Authorization middleware"}));
        }
        next();
    }
} 