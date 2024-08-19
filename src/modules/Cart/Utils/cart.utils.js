import { Product } from "../../../../DB/models/index.js";


export const checkProductStock = async (productId, quantity) => {
    return await Product.findOne({ _id: productId, stock: {$gte: quantity} })
}

export const calculateCartTotal = (products) => {
    let subTotal = 0;
    products.forEach(p => subTotal += p.price * p.quantity);

    return subTotal;
}