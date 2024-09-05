import { Coupon } from "../../../DB/models/index.js";
import { ErrorHandlerClass } from "../../utils/index.js"; 
import { CreateCouponValidaor } from "../validators/index.js";
import { validation } from "../middlewares/index.js";
import { isAuthQL } from "../middlewares/index.js";



export const createCouponResolver = async (parent, args) => {
    const { token, couponCode, couponAmount, couponType, from, till, createdBy, users } = args;

    // ======================== Auth ======================    
    const isAuth = await isAuthQL(token);
    if(isAuth.code !== 200){
        return new ErrorHandlerClass({ message: "Please signIn first", statusCode: 400, position: "at createCouponResolver api" });
    }

    // ======================= Validation ======================
    const isArgsValid = await validation(CreateCouponValidaor, args);
    if(isArgsValid !== true){ 
        return new ErrorHandlerClass({ message: JSON.stringify(isArgsValid), statusCode: 400, position: "at createCouponResolver api" });
    }

    const coupon = await Coupon.create({ couponCode, couponAmount, couponType, from, till, createdBy, users });

    return coupon;
}