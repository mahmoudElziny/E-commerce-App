
import { Cart } from "../../../DB/models/index.js";
import { ErrorHandlerClass } from "../../utils/index.js"; 
import { checkProductStock } from "./Utils/cart.utils.js";


/**
 * @api {post} /cart/add Add to cart
 */
export const addToCart = async (req, res, next) => {
    const userId = req.authUser._id;
    const quantity = req.body.quantity;
    const productId =  req.params.productId;

    const product = await checkProductStock(productId, quantity);
    if(!product){
        return next(new ErrorHandlerClass({message: "Product not found", statusCode: 404, position: "at addToCart api"}));
    }

    const cart = await Cart.findOne({ userId });
    if(!cart){
        const newCart = new Cart({
            userId,
            products: [
                {
                    productId: product._id,
                    quantity,
                    price: product.appliedPrice
                }
            ],
        });

        await newCart.save();
        return res.status(201 ).json({message: "Product added to cart successfully", data: newCart});
    }

    const isProductExist = cart.products.find(p => p.productId == productId);    
    if(isProductExist){
        return next(new ErrorHandlerClass({message: "Product already exist in cart", statusCode: 400, position: "at addToCart api"}));
    }

    cart.products.push({
        productId: product._id,
        quantity,
        price: product.appliedPrice
    });

    await cart.save();
    return res.status(200).json({message: "Product added to cart successfully", cart});

}

/**
 * @api {post} /cart/update Update cart
 */
export const updateCart = async (req, res, next) => {
    const userId = req.authUser._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId, 'products.productId': productId });
    if(!cart){
        return next(new ErrorHandlerClass({message: "Product not in cart", statusCode: 404, position: "at updateCart api"}));
    }

    const product = await checkProductStock(productId, quantity);
    if(!product){
        return next(new ErrorHandlerClass({message: "Product not available", statusCode: 404, position: "at updateCart api"}));
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() == product._id.toString());
    cart.products[productIndex].quantity = quantity; 

    

    await cart.save();
    return res.status(200).json({message: "Cart updated successfully", cart});

}

/**
 * @api {put} /cart/remove remove from cart
 */
export const removeFromCart = async (req, res, next) => {
    const userId = req.authUser._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId, 'products.productId': productId });
    if(!cart){
        return next(new ErrorHandlerClass({message: "Product not in cart", statusCode: 404, position: "at removeFromCart api"}));
    }

    cart.products = cart.products.filter(p => p.productId != productId);

    await cart.save();
    return res.status(200).json({message: "Product removed from cart successfully"});

}

/**
 * @api {get} /cart/ get cart
 */
export const getCart = async (req, res, next) => {
    const userId = req.authUser._id;
    const cart = await Cart.findOne({ userId });
    
    return res.status(200).json({message: "Cart found successfully", cart});
}