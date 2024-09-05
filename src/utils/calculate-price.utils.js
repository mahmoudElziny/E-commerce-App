import { DiscountTypeEnum } from "./index.js";


export const calculateProductPrice = (price, discount) => {
    let appliedPrice = price;
    if(discount.type === DiscountTypeEnum.PERCENTAGE) {
        appliedPrice =  price - ( price * discount.amount) / 100;
    }else if(discount.type === DiscountTypeEnum.FIXED) {
        appliedPrice =  price - discount.amount;
    }

    return appliedPrice;
}