
import { DateTime } from "luxon";
import { Address, Cart, Order } from "../../../DB/models/index.js";
import { ErrorHandlerClass, OrderStatus, PaymentMethods } from "../../utils/index.js";
import { calculateCartTotal } from "../Cart/Utils/cart.utils.js";
import { applyCoupon, validateCoupon } from "../Orders/Utils/order.utils.js";


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

    res.status(201).json({message: "Order created successfully", order: orderObj});

}