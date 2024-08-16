import { DiscountType } from "../utils/enums.utils.js";


export const calculateProductPrice = (price, discount) => {
    let appliedPrice = price;
    if(discount.type === DiscountType.PERCENTAGE) {
        appliedPrice =  price - ( price * discount.amount) / 100;
    }else if(discount.type === DiscountType.FIXED) {
        appliedPrice =  price - discount.amount;
    }

    return appliedPrice;
}