import  mongoose  from "../global-setup.js";
import slugify from "slugify";

import { DiscountType, Badges, calculateProductPrice } from "../../src/utils/index.js";


const { Schema, model } = mongoose;

const productSchema = new Schema({
    //Strings section
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        default: function() {
            return slugify(this.title, { lower: true, replacement: "_" });
        },
    },
    overview: String,
    specs: Object,
    badge: {
        type: String,
        enum: Object.values(Badges),    
    },
    //Numbers section
    price: {
        type: Number,
        required: true, 
        min: 10,
    },
    appliedDiscount: {
        amount: {
            type: Number,
            min: 0,
            default: 0,
        },
        type: {
            type: String,
            enum: Object.values(DiscountType),
            default: DiscountType.PERCENTAGE,
        },
    },
    appliedPrice: {
        type: Number,
        required: true,
        default: function() {
            return calculateProductPrice(this.price, this.appliedDiscount);
        },
    },
    stock: {
        type: Number,
        required: true,
        min: 5,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    //Images section
    images: {
        URLs: [{
            secure_url:{
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
                unique: true,
            },
        },],
        customId: {
            type: String,
            required: true,
            unique: true,
        }
    },
    //Id's section
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false, //TODO
    },

},{ timestamps: true});


export const Product = mongoose.models.Product || model("Product", productSchema);