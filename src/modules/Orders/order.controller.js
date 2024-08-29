
import { DateTime } from "luxon";
import { Address, Cart, Order, Product } from "../../../DB/models/index.js";
import { ApiFeatures, ErrorHandlerClass, OrderStatus, PaymentMethods, generateQrCode } from "../../utils/index.js";
import { calculateCartTotal } from "../Cart/Utils/cart.utils.js";
import { applyCoupon, validateCoupon } from "../Orders/Utils/order.utils.js";
import { createCheckoutSession, createStripeCoupon, createPaymentIntent, confirm, refundPaymentData } from "../../payment-handler/stripe.js";


export const createOrder = async (req, res, next) => {
    const userId = req.authUser._id;
    const { address, addressId, contactNumber, couponCode, shippingFee, VAT, paymentMethod } = req.body;

    //find loggedin user's cart with products
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || !cart.products.length) {
        return next(new ErrorHandlerClass({ message: "Empty cart", statusCode: 400, position: "at createOrder api" }));
    }
    
    //check if any product is sold out
    const isSoldOut = cart.products.find(p => p.productId.stock < p.quantity);
    if (isSoldOut) {
        return next(new ErrorHandlerClass({ message: `Product ${isSoldOut.productId.title} is sold out}`, statusCode: 400, position: "at createOrder api" }));
    }
    
    //calulate total price
    const subTotal = calculateCartTotal(cart.products);
    let total = subTotal + shippingFee + VAT;
    
    let coupon = null;
    if(couponCode){
        const isCouponValid = await validateCoupon(couponCode, userId); 
        
        if(isCouponValid.error){
            return next(new ErrorHandlerClass({message: isCouponValid.message, statusCode: 400, position: "at createOrder api"}));
        }
        
        coupon = isCouponValid.coupon;
        total = applyCoupon(subTotal, coupon);
    }
    
    //check the address
    if(!address && !addressId){
        return next(new ErrorHandlerClass({message: "Address is required", statusCode: 400, position: "at createOrder api"}));
    }

    if(addressId){
        //check if address id is valid
        const addressInfo = await Address.findOne({_id: addressId, userId});
        if(!addressInfo){
            return next(new ErrorHandlerClass({message: "Invalid address", statusCode: 400, position: "at createOrder api"})); 
        }
    }
    
    //order status
    let orderStatus = OrderStatus.PENDING;
    if(paymentMethod === PaymentMethods.CASH){
        orderStatus = OrderStatus.PLACED;
    }

    const orderObj = new Order({
        userId,
        products: cart.products,
        address,
        addressId,
        contactNumber,
        subTotal,
        shippingFee,
        VAT,
        couponId: coupon?._id,
        total,
        paymentMethod,
        orderStatus,
        estimatedDeliveryDate: DateTime.now().plus({days: 7}).toFormat('yyyy-MM-dd'),
    });
    
    await orderObj.save();

    //clear the cart
    cart.products = [];
    await cart.save();
    
    //qr code
    const qrCode = await generateQrCode([orderObj.total, orderObj._id, orderObj.products]);
    
    //success response
    res.status(201).json({message: "Order created successfully", order: orderObj, qrCode});

}

export const cancelOrder = async (req, res, next) => {
    const { _id } = req.authUser;
    const { orderId } = req.params;

    //get order data 
    const order = await Order.findOne({_id: orderId, userId: _id, orderStatus: {$in: [OrderStatus.PENDING, OrderStatus.PLACED, OrderStatus.CONFIRMED]}});
    if(!order){
        return next(new ErrorHandlerClass({message: "Order not found", statusCode: 404, position: "at cancelOrder api"}));
    }   
    //check if order bought before 3 days
    const orderData = DateTime.fromJSDate(order.createdAt);
    const currentDate = DateTime.now();
    const diff = Math.ceil(Number(currentDate.diff(orderData, 'days').toObject().days).toFixed(2));
    if(diff > 3){
        return next(new ErrorHandlerClass({message: "Order can not be cancelled after 3 days", statusCode: 400, position: "at cancelOrder api"}));
    }
    //update order status to cancelled
    order.orderStatus = OrderStatus.CANCELLED;
    order.cancelledAt = DateTime.now();
    order.cancelledBy = _id;

    await Order.updateOne({_id: orderId}, order );
    //update product model
    for(const product of order.products){
        await Product.updateOne({_id: product.productId}, {$inc: {stock: product.quantity}});
    }

    res.status(200).json({message: "Order cancelled successfully", order});

}

export const deliveredOrder = async (req, res, next) => {
    const { _id } = req.authUser;
    const { orderId } = req.params;

    //get order data 
    const order = await Order.findOne({_id: orderId, userId: _id, orderStatus: {$in: [ OrderStatus.PLACED, OrderStatus.CONFIRMED]}});
    if(!order){
        return next(new ErrorHandlerClass({message: "Order not found", statusCode: 404, position: "at deliveredOrder api"}));
    }  

    //update order status to delivered
    order.orderStatus = OrderStatus.DELIVERED;
    order.deliveredAt = DateTime.now();

    await Order.updateOne({_id: orderId}, order );

    res.status(200).json({message: "Order delivered successfully", order});
}

export const listOrders = async (req, res, next) => {
    const { _id } = req.authUser;

    const query = {userId: _id , ...req.query};

    const populateArray = [
        {path: "products.productId", select: "title images rating appliedPrice"},
    ];

    const ApiFeaturesInstance = new ApiFeatures(Order, query, populateArray).pagination().sort().filters();

    const orders = await ApiFeaturesInstance.mongooseQuery;

    res.status(200).json({message: "Orders fetched successfully", orders});
}

export const paymentWithStripe = async (req, res, next) => {
    const { orderId } = req.params;
    const { _id } = req.authUser;

    const order = await Order.findOne({_id: orderId, userId: _id, orderStatus: OrderStatus.PENDING});
    if(!order){
        return next(new ErrorHandlerClass({message: "Order not found", statusCode: 404, position: "at paymentWithStripe api"}));
    }

    const paymentObject  = {
        customer_email: req.authUser.email,
        metadata: {
            orderId: order._id.toString(),
        },
        discounts: [],
        line_items: order.products.map( (product) => {
            return {
                price_data: {
                    currency: "egp",
                    unit_amount: product.price * 100 , //in cents
                    product_data: {
                        name: req.authUser.userName,
                    },
                },
                quantity: product.quantity
            }
        }),
    }

    if(order.couponId){
        const stripeCoupon = await createStripeCoupon({couponId: order.couponId});
        if(stripeCoupon.status) {
            return next(new ErrorHandlerClass({message: stripeCoupon.message, statusCode: 400, position: "at paymentWithStripe api"}));
        }
        paymentObject.discounts.push({coupon: stripeCoupon.id});
    }

    const checkoutSession = await createCheckoutSession(paymentObject);
    const paymentIntent = await createPaymentIntent({
        amount: order.total,
        currency: "egp",
    });

    order.payment_intent_id = paymentIntent.id;
    await order.save();

    res.status(200).json({message: "Payment session created successfully", checkoutSession, paymentIntent});

}

export const stripeWebhookLocal = async (req, res, next) => {

    const orderId = req.body.data.object.metadata.orderId;

    const confirmOrder = await Order.findByIdAndUpdate( orderId, {orderStatus: OrderStatus.CONFIRMED});

    const confirmPaymentIntent = await confirm({paymentIntentId: confirmOrder.payment_intent_id});

    res.status(200).json({message: "Order confirmed successfully", confirmOrder});
}

export const refundPayment = async (req, res, next) => {

    const { orderId } = req.params;

    const findOrder = await Order.findOne({_id: orderId, orderStatus: OrderStatus.CONFIRMED});
    if(!findOrder){
        return next(new ErrorHandlerClass({message: "Order not found", statusCode: 404, position: "at refundPaymentData api"}));
    }
    
    const refund = await refundPaymentData({paymentIntentId: findOrder.payment_intent_id});
    if(refund.status != 'succeeded') {
        return next(new ErrorHandlerClass({message: refund.message, statusCode: 400, position: "at refundPaymentData api"}));
    }
    
    findOrder.orderStatus = OrderStatus.REFUNDED;
    await findOrder.save();

    res.status(200).json({message: "Order refunded successfully"});
}