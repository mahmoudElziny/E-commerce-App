import { DateTime } from "luxon";
import { Coupon } from "../../../../DB/models/index.js";
import { DiscountType } from '../../../utils/index.js';


/**
 * validateCoupon
 * @param {*} couponCode 
 * @param {*} userId 
 * @returns {message: String, error: Boolean, coupon: Object}
 */
export const validateCoupon = async (couponCode, userId) => {
    // get coupon by couponCode
    const coupon = await Coupon.findOne({ couponCode });
    if (!coupon) {
        return { message: "Invalid coupon code", error: true };
    }

    // check if coupon is enabled or not expired
    if (!coupon.isEnabled || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
        return { message: "Coupon is disabled or expired", error: true };
    }
    
    //check if coupon not started yet
    if(DateTime.now() < DateTime.fromJSDate(coupon.from)){
        return { message: `Coupon not started yet, will start on ${coupon.from}`, error: true };
    }

    // check if user not eligible to use coupon 
    const isUserNotEligible = coupon.users.some( u =>  u.userId.toString() !== userId.toString() || (u.userId.toString() === userId.toString() && u.maxCount <= u.usageCount));
    if(isUserNotEligible){
        return { message: "User not eligible to use coupon or you reedem all your tries", error: true };
    }

    return { coupon, error: false }; 
}

export const applyCoupon = (subTotal, coupon) => {
    let total = subTotal;
    const { couponAmount: disountAmount , couponType: discountType} = coupon;

    if(disountAmount && discountType) {
        if(discountType == DiscountType.PERCENTAGE){
            total = subTotal - (subTotal * disountAmount) / 100;
        }else if(discountType == DiscountType.FIXED){
            if(disountAmount > subTotal){
                return total;
            }
            total = subTotal - disountAmount;
        }
    }
    return total;
}