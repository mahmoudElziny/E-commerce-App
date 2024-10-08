import slugify from "slugify";
import { nanoid } from "nanoid";
import { ObjectId } from "mongodb";

import { cloudinaryConfig, ErrorHandlerClass, uploadFile, ApiFeatures } from "../../utils/index.js";
import { Brand, Category, SubCategory } from '../../../DB/models/index.js'



/**
 * @api {post} /category/create a new Category
 */
export const createCategory = async (req, res, next) => {
    const { _id } = req.authUser;
    
    let createdBy = new ObjectId(_id);
    
    //distructing the request body
    const { name } = req.body;

    //generating category slug
    const slug = slugify(name, {
        replacement: '_',
        lower: true,
    });

    //image
    if(!req.file){
        return next(new ErrorHandlerClass({message: "please upload an image", statusCode: 400, position: "at createCategory api"}));
    }

    //upload the image to cloudinary
    const customId = nanoid(4);
    const {secure_url, public_id} = await cloudinaryConfig().uploader.upload(req.file.path,{
        folder: `${process.env.UPLOADS_FOLDER}/categories/${customId}`,
    });

    //category object
    const category = {
        name,
        slug,
        images: {
            secure_url,
            public_id
        },
        createdBy,
        customId
    }

    //create the category in database
    const newCategory = await Category.create(category);
    
    //success response
    res.status(202).json({message: "Category created successfully", data: newCategory});
}

/**
 * @api {get} /category Get category by name or id or slug
 */
export const getCategory = async (req, res, next) => {

    const { id, name, slug } = req.query;

    const queryFilter = {};

    if(id) queryFilter._id = id;
    if(name) queryFilter.name = name;
    if(slug) queryFilter.slug = slug;

    const category = await Category.findOne(queryFilter);

    if(!category) {
        return next(new ErrorHandlerClass({
            message: "Category not found",
            statusCode: 400,
            position: "at getCategory api"
        }));
    }

    res.status(200).json({
        message: "Category found",
        data: category
    });
}

/**
 * @api {put} /category/update:_id update category 
 */
export const updateCategory = async (req, res, next) => {

    //distruct category id from request params
    const { _id } = req.params; 

    //find the category by id
    const category = await Category.findById(_id);

    if(!category){
        return next(new ErrorHandlerClass({message: "Category not found", statusCode: 404, position: "at updateCategory api"}));
    }

    //distruct category name & public_id_new from request body
    const { name } = req.body ;
    
    if(name){
        const slug = slugify(name, {
            replacement: "_",
            lower: true,
        });

        category.name = name;
        category.slug = slug;
        
    }  

    //image update
    if(req.file){
        const splitedPublicId = category.images.public_id.split(`${category.customId}/`)[1];
        const { secure_url } = await uploadFile({
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/categories/${category.customId}`,
            publicId: splitedPublicId,
        });
        

        category.images.secure_url = secure_url;
    }
        
    await category.save();

    res.status(200).json({
        message: "Category updated succcessfully",
        data: category,
    })
}

/**
 * @api {delete} /category/delete:_id delete category 
 */
export const deleteCategory = async (req, res, next) => {

    //distruct category id from request params
    const { _id } = req.params; 

    //find the category by id
    const category = await Category.findByIdAndDelete(_id);

    if(!category){
        return next(new ErrorHandlerClass({message: "Category not found", statusCode: 404, position: "at deleteCategory api"}));
    }

    const categoryPath = `${process.env.UPLOADS_FOLDER}/categories/${category.customId}`;

    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
    await cloudinaryConfig().api.delete_folder(categoryPath);

    res.status(200).json({message: "Category deleted successfully", data: category});
} 


//categories paginated with its subcatgories
export const listCategories = async (req, res, next) => {
    
    const apiFeaturesInstance = new ApiFeatures(Category.aggregate([
        {
            $lookup: {
                from: "subcategories",
                localField: "_id",
                foreignField: "categoryId",
                as: "subCategories"
            }
        }
    ]), req.query).pagination();

    const categories = await apiFeaturesInstance.mongooseQuery;

    res.status(200).json({
        message: "Categories found",
        data: categories
    });

}