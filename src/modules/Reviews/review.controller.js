import { Review, Product, Order } from "../../../DB/models/index.js";
import { OrderStatus, ReviewStatus } from "../../utils/index.js";




export const addReview = async (req, res, next) => {
    
    const { _id } = req.authUser;
    const { productId, reviewRating, reviewContent } = req.body;

    //check if user already added review to this product
    const isAlreadyReviewed = await Review.findOne({ userId: _id, productId });
    if(isAlreadyReviewed){
        return next(new ErrorHandlerClass({message: "You already added a review to this product", statusCode: 400, position: "at addReview api"}));
    }
    //check if product exists
    const product = await Product.findOne({ _id: productId });
    if(!product){
        return next(new ErrorHandlerClass({message: "Product not found", statusCode: 404, position: "at addReview api"}));
    }
    //check if user bought this product
    const isBought = await Order.findOne({ userId: _id, "products.productId": productId, orderStatus: OrderStatus.DELIVERED });
    if(!isBought){
        return next(new ErrorHandlerClass({message: "You must buy this product before leaving a review", statusCode: 400, position: "at addReview api"}));
    }
    
    const review = {
        userId: _id,
        productId,
        reviewRating,
        reviewContent,
    };

    const newReview = await Review.create(review);

    res.status(201).json({message: "Review added successfully", data: newReview});
}

export const listReviews = async (req, res, next) => {

    const reviews = await Review.find().populate([
        {
        path: "userId",
        select: "userName email -_id",
        },
        {
        path: "productId",
        select: "title rating -_id",
        }
    ]);

    res.status(200).json({message: "Reviews found successfully", data: reviews});
}

export const approveOrRejectReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const { accept, reject } = req.body;
    if(accept && reject){
        return next(new ErrorHandlerClass({message: "You can't accept and reject at the same time", statusCode: 400, position: "at approveOrRejectReview api"}));
    }

    const review = await Review.findByIdAndUpdate(reviewId, {
        reviewStatus: accept
        ? ReviewStatus.APPROVED 
        : reject 
        ? ReviewStatus.REJECTED 
        : ReviewStatus.PENDING    
    },
    { new: true });
    
    res.status(200).json({message: "Review updated successfully", data: review});
}