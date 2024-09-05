import Joi from "joi";
import { CouponType } from "../../utils/index.js";


export const CreateCouponValidaor =  Joi.object({
    couponCode: Joi.string().required(),
    from: Joi.date().greater(Date.now()).required(),
    till: Joi.date().greater(Joi.ref("from")).required(),
    couponType: Joi.string().valid(...Object.values(CouponType)).required(),
    couponAmount: Joi.number().when('couponType', {
        is: Joi.string().valid(CouponType.PERCENTAGE),
        then: Joi.number().max(100).required(),
    }).min(1).required().messages({
        'number.min': 'Coupon amount must be greater than    0',
        'number.max': 'Coupon amount must be less than or equal to 100',
    }),
    token: Joi.string().required(), 
    createdBy: Joi.string().required(),
})