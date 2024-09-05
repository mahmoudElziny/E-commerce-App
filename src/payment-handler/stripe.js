import Stripe from "stripe";

import { Coupon } from "../../DB/models/index.js";
import { DiscountTypeEnum } from "../utils/index.js";


//create checkout session
export const createCheckoutSession = async ({customer_email, metadata, discounts, line_items}) => {

    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
    
    const paymentDate  = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email, 
        metadata,
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        discounts,
        line_items,
    });
    return paymentDate;
}

//create stripe coupon
export const createStripeCoupon = async ({couponId}) => {

    const isCoupon = await Coupon.findById(couponId);
    if(!isCoupon) {
        return new ErrorHandlerClass({message: "Coupon not found", statusCode: 404, position: "at createStripeCoupon api"});
    }
    
    let couponObj = {};
    if(isCoupon.couponType == DiscountTypeEnum.FIXED) { 
        couponObj = {
            name: isCoupon.couponCode,
            amount_off: isCoupon.couponAmount * 100, //in cents
            currency: "egp",
        };
    }
    if(isCoupon.couponType == DiscountTypeEnum.PERCENTAGE) {
        couponObj = {
            name: isCoupon.couponCode,
            percent_off: isCoupon.couponAmount,
        };
    } 

    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

    const stripeCoupon = await stripe.coupons.create(couponObj);

    return stripeCoupon;

}

//create payment method
export const createPaymentMethod = async ({token}) => {

    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
    const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
            token,
        }   
    });
    return paymentMethod; 
}

//create payment intent
export const createPaymentIntent = async ({amount, currency}) => {

    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

    const paymentMethod = await createPaymentMethod({ token: 'tok_visa' });

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        automatic_payment_methods: {enabled: true, allow_redirects: "never"},
        payment_method: paymentMethod.id
    });
    return paymentIntent;
} 


//retrieve payment intent
export const retrievePaymentIntent = async ({ paymentIntentId }) => {

    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return paymentIntent;
}

//confirm payment intent
export const confirm = async ({ paymentIntentId }) => {

    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

    const paymentDetails = await retrievePaymentIntent({ paymentIntentId });

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, { payment_method: paymentDetails.payment_method } );

    return paymentIntent;

}

export const refundPaymentData = async ({ paymentIntentId }) => {
    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
    });
    
    return refund;
}