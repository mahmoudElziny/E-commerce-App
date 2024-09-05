import { Product } from "../../../DB/models/index.js";




export const listProductResolver = async () => {
    return await Product.find();
}