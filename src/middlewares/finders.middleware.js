import { ErrorHandlerClass } from "../utils/index.js";


export const getDocumentByName = (model) => {
    return async (req, res, next) => {
        const { name } = req.body;
        if (name) {
            const document = await model.findOne({ name });
            if (document) {
                return next(new ErrorHandlerClass({
                    message: `${model.modelName} Document already exists`,
                    statusCode: 404,
                }));
            }
        }

        next();
    }
}


export const checkIfIdExists = (model) => {
    return async (req, res, next) => {

        const { categoryId, subCategoryId, brandId } = req.query;

        //Id's check 
        const document = await model.findOne({ _id: brandId, categoryId: categoryId, subCategoryId: subCategoryId })
            .populate([
                { path: "categoryId", select: "customId" },
                { path: "subCategoryId", select: "customId" }
            ]);

        if (!document) {
            return next(new ErrorHandlerClass({ message: `${model.modelName} not found`, statusCode: 404}));
        }
        
        req.document = document;
        next();
    }
}