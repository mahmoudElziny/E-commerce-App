import mongoose from "mongoose";
import { PaymentMethods, OrderStatus } from "../../src/utils/index.js";
import { Product, Coupon } from "./index.js";

const { Schema, model } = mongoose;

const orderSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1,
            },
            price: {
                type: Number,
                required: true,
            }
        }
    ],
    fromCart: {
        type: Boolean,
        default: true,
    },
    address: String,
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
    },
    contactNumber: {
        type: String,
        required: true,
    },
    subTotal: {
        type: Number,
        required: true,
    },
    shippingFee: {
        type: Number,
        required: true,
    },
    VAT: {
        type: Number,
        required: true,
    },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
    },
    total: {
        type: Number,
        required: true,
    },
    estimatedDeliveryDate: {
        type: Date,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethods),
        required: true,
    },
    orderStatus: {
        type: String,
        enum: Object.values(OrderStatus),
        required: true,
    },
    deliveredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    cancelledBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    deliveredAt: Date,
    cancelledAt: Date,
    payment_intent_id: String,

}, { timestamps: true });


orderSchema.post("save", async function () {
    //decrement stock of products
    for(const product of this.products){
        await Product.updateOne({_id: product.productId}, {$inc: {stock: -product.quantity}});
    }
    //increment the usage of coupon 
    if(this.couponId){
        const coupon = await Coupon.findById(this.couponId);
        coupon.users.find(u => u.userId.toString() === this.userId.toString()).usageCount++;
        await coupon.save();
    }
}); 


export const Order = mongoose.models.Order || model("Order", orderSchema);