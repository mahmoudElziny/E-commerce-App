import { Types } from "mongoose";
import Joi from "joi";


/**
 * 
 * @param {any} value 
 * @param {any} helper 
 * @returns {any} returns the value if it is valid otherwise returns error message
 * @description take the value to be tested and validate it in terms of the certain conditions
 */
export const objectIdRule = (value, helper) => {
    const isObjectIdValid = Types.ObjectId.isValid(value);
    return isObjectIdValid? value : helper.message("Invalid ObjectId");
}


// general rules that used permanently through the projet
export const generalRules = {
    ObjectId: Joi.string().custom(objectIdRule),
    Headers: {
        "content-type": Joi.string().valid("application/json").optional(),
        "user-agent": Joi.string().optional(),
        host: Joi.string().optional(),
        "content-length": Joi.number().optional(),
        "accept-encoding": Joi.string().optional(),
        accept: Joi.string().optional(),
        connection: Joi.string().optional(),
        "postman-token": Joi.string().optional(),
    },
}