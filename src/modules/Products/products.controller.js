import { nanoid } from "nanoid";
import slugify from "slugify";
//utils
import { ErrorHandlerClass, uploadFile, calculateProductPrice, ApiFeatures, ReviewStatus} from "../../utils/index.js";
//models
import { Product } from "../../../DB/models/index.js";




/**
 * @api {post} /product/add Add product 
 */
export const addProduct = async (req, res, next) => {
    const { _id } = req.authUser;
    //distructing the request body
    const { title, overview, specs, price, discountAmount, discountType, stock } = req.body;
    //images from req.file 
    if(!req.files.length){
        return next(new ErrorHandlerClass({message: "please upload an image", statusCode: 400, position: "at addProduct api"}));
    }

    const brandDocument = req.document;
    

    //images handling
    const brandCustomId = brandDocument.customId;
    const categoryCustomId = brandDocument.categoryId.customId; 
    const subCategoryCustomId = brandDocument.subCategoryId.customId; 
    const customId = nanoid(4);
    const folder = `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/sub-categories/${subCategoryCustomId}/brands/${brandCustomId}/products/${customId}`;
    let URLs = [];
    for(const file of req.files ){
        //upload each file to cloudinary
        const { secure_url, public_id } = await uploadFile({
            file: file.path,
            folder: folder,
        });
        URLs.push({secure_url, public_id});
    }    


    const productObject = {
        title,
        overview,
        specs: JSON.parse(specs),
        price,
        appliedDiscount: {
            amount: discountAmount,
            type: discountType
        },
        stock,
        images: {
            URLs, 
            customId,
        },
        categoryId: brandDocument.categoryId._id,
        subCategoryId: brandDocument.subCategoryId._id,
        brandId: brandDocument._id,
        createdBy : _id
    };

    //create in database
    const newProduct = await Product.create(productObject);

    //success response
    res.status(201).json({
        message: "Product created successfully",
        data: newProduct,
    });
}

/**
 * @api {put} /product/update/:_id Update product 
 * @todo update images to cloudinary
 */
export const updateProduct = async (req, res, next) => {
    //distructing product id from request params
    const { _id } = req.params;
    //distructing the request body
    const { title, stock, overview, badge, price, discountAmount, discountType, specs } = req.body;

    //find the product by id
    const product = await Product.findById(_id);
    if(!product){
        return next(new ErrorHandlerClass({message: "Product not found", statusCode: 404, position: "at updateProduct api"}));
    }

    if(title){
        product.title = title;
        product.slug = slugify(title,{
            replacement: "_",
            lower: true,
        });
    }
    if(stock) product.stock = stock; 
    if(overview) product.overview = overview;
    if(badge) product.badge = badge;   
    if(price || discountAmount || discountType) { 
        const newPrice = price || product.price;
        const discount = {};
        discount.amount = discountAmount || product.appliedDiscount.amount;
        discount.type = discountType || product.appliedDiscount.type;
        
        product.appliedPrice = calculateProductPrice(newPrice, discount);

        product.price = newPrice;
        product.appliedDiscount = discount;
    } 
     
    if(specs) product.specs = specs;

    //images update
    // if(req.files){
    //     for(const file of req.files ){
    //         const { secure_url, public_id } = await uploadFile({
    //             file: file.path,
    //             folder: folder,
    //         });
    //         URLs.push({secure_url, public_id});
    //     }


    //     const splitedPublicId = category.images.public_id.split(`${category.customId}/`)[1];
    //     const { secure_url } = await uploadFile({
    //         file: req.file.path,
    //         folder: `${process.env.UPLOADS_FOLDER}/categories/${category.customId}`,
    //         publicId: splitedPublicId,
    //     });
        

    //     category.images.secure_url = secure_url;
    // }


    //update in database
    await product.save();

    //success response
    res.status(200).json({
        message: "Product updated successfully",
        data: product,
    });

}

/**
 * @api {delete} /product/delete/:_id Delete product
 */
export const deleteProduct = async (req, res, next) => {

    //distruct product id from request params
    const { _id } = req.params; 

    //find the category by id
    const product = await Product.findByIdAndDelete(_id).populate("categoryId").populate("subCategoryId").populate("brandId");

    if(!product){
        return next(new ErrorHandlerClass({message: "Product not found", statusCode: 404, position: "at deleteProduct api"}));
    }

    const productPath = `${process.env.UPLOADS_FOLDER}/categories/${product.categoryId.customId}/sub-categories/${product.subCategoryId.customId}/brands/${product.brandId.customId}/products/${product.images.customId}`;

    await cloudinaryConfig().api.delete_resources_by_prefix(productPath);
    await cloudinaryConfig().api.delete_folder(productPath);

    res.status(200).json({message: "Product deleted successfully", data: product});
} 

/**
 * @api {get} /product/:_id get product by id
 */
export const getProduct = async (req, res, next) => {

    const { _id } = req.params;

    const product = await Product.findById(_id);

    if(!product) {
        return next(new ErrorHandlerClass({
            message: "Product not found",
            statusCode: 400,
            position: "at getProduct api"
        }))
    }

    res.status(200).json({
        message: "Product found successfully",
        data: subCategory
    })
}

/**
 * @api {get} /product/list list all products
 */
export const listProducts = async (req, res, next) => {    

    const ApiFeaturesInstance = new ApiFeatures(Product, req.query, [
        { path: "Reviews", match: { reviewStatus: ReviewStatus.APPROVED } },
    ]).pagination().filters();

    const products = await ApiFeaturesInstance.mongooseQuery;
    //success response
    res.status(200).json({
        message: "Products fetched successfully",
        data: products,
    });
}