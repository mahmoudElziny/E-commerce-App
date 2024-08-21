
import { Coupon, User, CouponChangeLog } from "../../../DB/models/index.js";
import { ErrorHandlerClass } from "../../utils/index.js";



/**
 * @api {post} /coupon/create create coupon
 */
export const createCoupon = async (req, res, next) => {
    const { couponCode, from, till, couponAmount, couponType, users } = req.body;
    //coupon code must be unique
    const isCouponCodeExist = await Coupon.findOne({ couponCode });
    if (isCouponCodeExist) {
        return next(new ErrorHandlerClass({ message: "Coupon code already exist", statusCode: 404, position: "at createCoupon api" }));
    }

    const userIds = users.map((user) => user.userId);
    const validUsers = await User.find({ _id: { $in: userIds } });
    if (validUsers.length !== userIds.length) {
        return next(new ErrorHandlerClass({ message: "Invalid Users", statusCode: 400, position: "at createCoupon api" }));
    }

    const newCoupon = new Coupon({ couponCode, from, till, couponAmount, couponType, users, createdBy: req.authUser._id });
    await newCoupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });

};

/**
 * @api {get} /coupon get all coupon
 */
export const getAllCoupons = async (req, res, next) => {
    const { isEnabled } = req.query;
    const filters = {};
    if (isEnabled) {
        filters.isEnabled = isEnabled == "true" ? true : false;
    }
    const coupons = await Coupon.find(filters);

    res.status(200).json({ message: "Coupons found successfully", coupons });
}

/**
 * @api {get} /coupon/:_id get coupon by id
 */
export const getCouponById = async (req, res, next) => {
    const { _id } = req.params;
    const coupon = await Coupon.findById(_id);
    if (!coupon) {
        return next(new ErrorHandlerClass({ message: "Coupon not found", statusCode: 404, position: "at getCouponById api" }));
    }
    res.status(200).json({ message: "Coupon found successfully", coupon });
}

/**
 * @api {put} /coupon/:couponId update coupon
 */
export const updateCoupon = async (req, res, next) => {
    const {couponId} = req.params;
    const userId = req.authUser._id;
    const { couponCode, from, till, couponAmount, couponType, users } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        return next(new ErrorHandlerClass({ message: "Coupon not found", statusCode: 404, position: "at updateCoupon api" }));
    }

    const logUpdatedObject = { couponId, updatedBy: userId, changes: {} };

    if (couponCode) {
        const isCouponCodeExists = await Coupon.findOne({ couponCode });
        if (isCouponCodeExists) {
            return next(new ErrorHandlerClass({ message: "Coupon code already exist", statusCode: 404, position: "at updateCoupon api" }));
        }
        coupon.couponCode = couponCode;
        logUpdatedObject.changes.couponCode = couponCode;
    }
    if (from) {
        coupon.from = from;
        logUpdatedObject.changes.from = from;
    }
    if (till) {
        coupon.till = till;
        logUpdatedObject.changes.till = till;
    }
    if (couponAmount) {
        coupon.couponAmount = couponAmount;
        logUpdatedObject.changes.couponAmount = couponAmount;
    }
    if (couponType) {
        coupon.couponType = couponType;
        logUpdatedObject.changes.couponType = couponType;
    }
    if (users) {
        const userIds = users.map((user) => user.userId);
        const validUsers = await User.find({ _id: { $in: userIds } });
        if (validUsers.length !== userIds.length) {
            return next(new ErrorHandlerClass({ message: "Invalid Users", statusCode: 400, position: "at createCoupon api" }));
        }
        coupon.users = users;
        logUpdatedObject.changes.users = users;
    }

    await coupon.save();
    const log = await new CouponChangeLog(logUpdatedObject).save();

    res.status(200).json({ message: "Coupon updated successfully", coupon, log }); 

}

/**
 * @api {patch} /coupon/enable/:couponId Disable or enable coupon
*/
export const disableEnableCoupon = async (req, res, next) => {
    const {couponId} = req.params;
    const userId = req.authUser._id;
    const { enable } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        return next(new ErrorHandlerClass({ message: "Coupon not found", statusCode: 404, position: "at disableEnableCoupon api" }));
    }

    const logUpdatedObject = { couponId, updatedBy: userId, changes: {} };
    
    if(enable === true) {
        coupon.isEnabled = true;
        logUpdatedObject.changes.isEnabled = true;
    }else if(enable === false) {
        coupon.isEnabled = false;
        logUpdatedObject.changes.isEnabled = false;
    }

    await coupon.save();
    const log = await new CouponChangeLog(logUpdatedObject).save();

    res.status(200).json({ message: "Coupon updated successfully", coupon, log });


}

/** 
 * @api {delete} /coupon/:_id delete coupon
 */


/**
 * @todo add apply coupon api after creating order
 * @api {post} /coupon/apply apply coupon
 */