import { ErrorHandlerClass } from "../utils/index.js";

/**
 * Error handle middleware
 * @param {Function} API 
 * @returns {Function} returns the response of API in param if there is no error 
 * @description  return the response of the api in param if there is no error & if there is an error it passes it to the 
 * next API ( globalResponse ) to handle it. 
 */
export const errorHandle = (API) => {
    return (req, res, next) => {
        API(req, res, next).catch(
            (err) => {
                next( new ErrorHandlerClass( {message: err.message, statusCode: err.statusCode, stack: err.stack, position: err.position, data: err.data} ) );
            }
        );       
    };
};

/**
 *global Response
 * @param {object} err 
 * @param {object} req 
 * @param {object} res 
 * @param {object} next
 * @returns {object} return the response to user in case there is an error after handling it
 * @description handling the response to user in case there is any error
 */
export const globalResponse = (err, req, res, next) => {
    if(err){
        res.status(err["statusCode"] || 500 ).json({
            message: "Error response",
            error: err.message,
            stack: err.stack,
            position: err.position,
            data: err.data
        });    
    }
}