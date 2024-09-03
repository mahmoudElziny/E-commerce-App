import slugify from "slugify";
import { nanoid } from "nanoid";

import { cloudinaryConfig, ErrorHandlerClass, uploadFile } from "../../utils/index.js";
import { Category, SubCategory, Brand } from "../../../DB/models/index.js";
import { ApiFeatures } from "../../utils/index.js";


/**
 * @api {post} /brand/create create a new Brand 
 */
export const createBrand = async (req, res, next) => {

    const { categoryId, subCategoryId } = req.query;
    
    const { _id } = req.authUser;
    
    const isSubCategory = await SubCategory.findOne({_id: subCategoryId, categoryId: categoryId}).populate("categoryId");
    
    if(!isSubCategory) {
        return next(new ErrorHandlerClass({message: "SubCategory not found", statusCode: 404, position: "at createBrand api"}));
    }

    const { name } = req.body;

    const slug = slugify(name, {
        replacement: "_",
        lower: true,
    });

    if(!req.file) {
        return next(new ErrorHandlerClass({message: "please upload an image", statusCode: 400, position: "at createBrand api"}));
    }

    const customId = nanoid(4);

    const { secure_url, public_id } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/categories/${isSubCategory.categoryId.customId}/sub-categories/${isSubCategory.customId}/brands/${customId}`,
    });
    
    const brandObj = {
        name,
        slug,
        logo: {
            secure_url,
            public_id
        },
        customId,
        categoryId: isSubCategory.categoryId._id,
        subCategoryId: isSubCategory._id,
        createdBy: _id
    };

    const newBrand = await Brand.create(brandObj);

    res.status(201).json({
        message: "Brand created successfully",
        data: newBrand
    });
}

/**
 * @api {get} /brand get brand
 */
export const getBrand = async (req, res, next) => {

    const { id, name, slug } = req.query;

    const queryFilter = {};

    if(id) queryFilter._id = id;
    if(name) queryFilter.name = name;
    if(slug) queryFilter.slug = slug;

    const brand = await Brand.findOne(queryFilter);

    if(!brand) {
        return next(new ErrorHandlerClass({message: "Brand not found", statusCode: 404, position: "at getBrand api"}));
    }

    res.status(200).json({
        message: "Brand found successfully",
        data: brand
    });
}

/**
 * @api {put} /brand/update:_id update brand
 */
export const updateBrand = async (req, res, next) => {

    const { _id } = req.params;

    const { name } = req.body;

    const brand = await Brand.findById(_id).populate("categoryId").populate("subCategoryId");

    if(!brand){
        return next(new ErrorHandlerClass({message: "Brand not found", statusCode: 404, position: "at updateBrand api"}));
    }

    if(name){
        const slug = slugify(name, {
            replacement: "_",
            lower: true,
        });
        brand.name = name;
        brand.slug = slug;
    }

    if(req.file){
        const splitedPublicId = brand.logo.public_id.split(`${brand.customId}/`)[1];
        const { secure_url } = await uploadFile({
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/categories/${brand.categoryId.customId}/sub-categories/${brand.subCategoryId.customId}/brands/${brand.customId}`,
            publicId: splitedPublicId,
        });

        brand.logo.secure_url = secure_url;
    }

    await brand.save(); 

    res.status(200).json({
        message: "Brand updated successfully",
        data: brand
    });


}

/**
 * @api {delete} /brand/delete:_id delete brand
 */
export const deleteBrand = async (req, res, next) => {

    const { _id } = req.params;

    const brand = await Brand.findByIdAndDelete(_id).populate("categoryId").populate("subCategoryId");

    if(!brand){
        return next(new ErrorHandlerClass({message: "Brand not found", statusCode: 404, position: "at deleteBrand api"}));
    }

    const brandPath = `${process.env.UPLOADS_FOLDER}/categories/${brand.categoryId.customId}/sub-categories/${brand.subCategoryId.customId}/brands/${brand.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
    await cloudinaryConfig().api.delete_folder(brandPath);


    res.status(200).json({
        message: "brand deleted succssfully"
    })

}

export const listBrandsForSpecificSubCategoryOrCategory = async (req, res, next) => {
    const { name } = req.params;

    const brands = await Brand.find({}).populate("categoryId").populate("subCategoryId");

    if(!brands){
        return next(new ErrorHandlerClass({message: "Brands not found", statusCode: 404, position: "at listBrandsForSpecificSubCategoryOrCategory api"}));
    }
    
    let matchedBrands = [];
    let category = false;
    let subategory = false;
    
    brands.forEach(brand => {
        if(brand.subCategoryId.name === name){
            subategory = true;
            matchedBrands.push(brand);
        }else if(brand.categoryId.name === name){
            category = true;
            matchedBrands.push(brand);
        }
    });
    
    let result = [];

    matchedBrands.forEach(brand => {
        if(category){
            const { logo, _id, name, slug, customId, categoryId, createdAt, updatedAt } = brand;
            const brandObj = {
                logo, _id, name, slug, customId, categoryId, createdAt, updatedAt
            }
            result.push(brandObj);
        }else if (subategory){
            const { logo, _id, name, slug, customId, subCategoryId, createdAt, updatedAt } = brand;
            const brandObj = {
                logo, _id, name, slug, customId, subCategoryId, createdAt, updatedAt
            }
            result.push(brandObj);
        }
    });
    
    //success response
    res.status(200).json({
        message: "Brands found successfully",
        data: result
    })
}

export const listBrandsWithProducts = async (req, res, next) => {
    const apiFeaturesInstance = new ApiFeatures(Brand.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "brandId",
                as: "products"
            }
        }
    ]), req.query).pagination();

    const brands = await apiFeaturesInstance.mongooseQuery;

    res.status(200).json({
        message: "Brands found",
        data: brands
    });
}

