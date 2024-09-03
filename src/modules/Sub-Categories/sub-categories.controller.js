import slugify from "slugify";
import { nanoid } from "nanoid";

import { cloudinaryConfig, ErrorHandlerClass, uploadFile } from "../../utils/index.js";
import { Brand, Category, SubCategory } from "../../../DB/models/index.js";
import { ApiFeatures } from "../../utils/index.js";


/**
 * @api {post} /subcategory/create a new Sub-Category
 */
export const createSubCategory = async (req, res, next) => {
    //check category id
    const category = await Category.findById(req.query.categoryId); 
    //check if category exists
    if(!category) {
        return next(new ErrorHandlerClass({message: "Category not found", statusCode: 404, position: "at createSubCategory api"}));
    }
    
    const { _id } = req.authUser;
    const { name } = req.body;
    createdBy = _id;

    const slug = slugify(name, {
        replacement: '_',
        lower: true,
    });

    if(!req.file) {
        return next(new ErrorHandlerClass({message: "please upload an image", statusCode: 400, position: "at createSubCategory api"}));
    }

    const customId = nanoid(4);
    
    const { secure_url, public_id } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/categories/${category.customId}/sub-categories/${customId}`,
    });
    
    const subCategoryObj = {
        name,
        slug,
        images: {
            secure_url,
            public_id
        },
        customId,
        createdBy,
        categoryId: category._id
    }
    
    const newSubCategory = await SubCategory.create(subCategoryObj);

    res.status(201).json({
        message: "SubCategory created successfully",
        data: newSubCategory
    });

}

/**
 * @api {get} /subCategory Get subCategory by name or id or slug
 */
export const getSubCategory = async (req, res, next) => {

    const { id, name, slug } = req.query;

    const queryFilter = {};

    if(id) queryFilter._id = id;
    if(name) queryFilter.name = name;   
    if(slug) queryFilter.slug = slug;

    const subCategory = await SubCategory.findOne(queryFilter);

    if(!subCategory) {
        return next(new ErrorHandlerClass({
            message: "SubCategory not found",
            statusCode: 400,
            position: "at getSubCategory api"
        }))
    }

    res.status(200).json({
        message: "SubCategory found successfully",
        data: subCategory
    })
}

/**
 * @api {put} /subCategory/update:_id update subCategory 
 */
export const updateSubCategory = async (req, res, next) => {

    const { _id } = req.params;

    const subCategory = await SubCategory.findById(_id).populate("categoryId");

    if(!subCategory) {
        return next(new ErrorHandlerClass({message: "SubCategory not found", statusCode: 404, position: "at updateSubCategory api"}));
    }

    const { name } = req.body;

    if(name){
        const slug = slugify(name, {
            replacement: "_",
            lower: true,
        }); 
        subCategory.name = name;
        subCategory.slug = slug;
    }
    
    //image update
    if(req.file){
        const splitedPublicId = subCategory.images.public_id.split(`${subCategory.customId}/`)[1];
        const { secure_url } = await uploadFile({
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/categories/${subCategory.categoryId.customId}/sub-categories/${subCategory.customId}`,
            publicId: splitedPublicId,
        });
        

        subCategory.images.secure_url = secure_url;
    }

    await subCategory.save();

    res.status(200).json({
        message: "SubCategory updated successfully",
        data: subCategory
    });

}

/**
 * @api {delete} /subCategory/delete:_id delete subCategory 
 */
export const deleteSubCategory = async (req, res, next) => {

    const { _id } = req.params;

    const subCategory = await SubCategory.findByIdAndDelete(_id).populate("categoryId"); 
    
    if(!subCategory) {
        return next(new ErrorHandlerClass({message: "SubCategory not found", statusCode: 404, position: "at deleteSubCategory api"}));
    }

    const subCategoryPath = `${process.env.UPLOADS_FOLDER}/categories/${subCategory.categoryId.customId}/sub-categories/${subCategory.customId}`;

    await cloudinaryConfig().api.delete_resources_by_prefix(subCategoryPath);
    await cloudinaryConfig().api.delete_folder(subCategoryPath);


    res.status(200).json({message: "subCategory deleted successfully"});
}

export const listSubCategories = async (req, res, next) => {
    const apiFeaturesInstance = new ApiFeatures(SubCategory.aggregate([
        {
            $lookup: {
                from: "brands",
                localField: "_id",
                foreignField: "subCategoryId",
                as: "brands"
            }
        }
    ]), req.query).pagination();

    const subCategories = await apiFeaturesInstance.mongooseQuery;

    res.status(200).json({
        message: "SubCategories found",
        data: subCategories
    });
}
