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