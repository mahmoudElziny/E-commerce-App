import { ErrorHandlerClass } from "../utils/index.js";

// all request keys array
const reqKeys = ["body", "params", "query", "headers", "file", "files", "authUser"];

/**
 * validation Middleware
 * @param {object} schema 
 * @returns {Function} passes the data if it is valid to the next API
 * @description test the data entered by user if it is valid 
 */
export const validationMiddleware = (schema) => {
    return (req, res, next) => {
        
        //array of validation errors
        let validationErrors = [];
        
        //looping through every key to validate data in it
        for(const key of reqKeys){

            const validationResult = schema[key]?.validate(req[key], { abortEarly: false });
            
            //pushes the unvalid date to validatioErrors array 
            if(validationResult?.error){
                validationErrors.push(validationResult.error.details);
            } 
        }

        //if there is unvalid data passed to error handler otherwise move to next middleware
        validationErrors.length
        ? next( new ErrorHandlerClass({message: "Validation Error", statusCode: 400, position: "at validationMiddleware", data: { error: validationErrors}}) )
        : next();


    };
}

