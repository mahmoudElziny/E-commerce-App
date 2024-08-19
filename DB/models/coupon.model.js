import mongoose from "mongoose";
import { CouponType } from "../../src/utils/index.js";

const { Schema, model } = mongoose;

const couponSchema = new Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,
    },
    couponAmount: {
        type: Number,
        required: true,
    },
    couponType: {
        type: String,
        required: true,
        enum: Object.values(CouponType),
    },
    from: {
        type: Date,
        required: true,
    },
    till: {
        type: Date,
        required: true,
    },
    users: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            maxCount: {
                type: Number,
                required: true,
                min: 1,
            },
            usageCount: {
                type: Number,
                default: 0,
            }
        }
    ],
    isEnabled: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }

}, { timestamps: true });



export const Coupon = mongoose.models.Coupon || model("Coupon", couponSchema);


//create Coupon change log model

const couponChangeLogSchema = new Schema({
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    changes: {
        type: Object,
        required: true,
    }
}, { timestamps: true });



export const CouponChangeLog = mongoose.models.CouponChangeLog || model("CouponChangeLog", couponChangeLogSchema);
