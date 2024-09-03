import { Router } from "express";

import * as middlewares from "../../middlewares/index.js";
import * as controller from "./brand.controller.js";    
import { extentions } from "../../utils/index.js";
import { systemRoles } from "../../utils/index.js";
import { Brand } from "../../../DB/models/index.js";

const { errorHandle, multerHost, getDocumentByName, authorization, auth } = middlewares;

const brandRouter = Router();

brandRouter.post('/create',
    auth(),
    multerHost({allowedExtentions: extentions.Images}).single('image'),
    getDocumentByName(Brand),
    authorization(systemRoles.ADMIN),
    errorHandle(controller.createBrand)
);

brandRouter.get('/', errorHandle(controller.getBrand));

brandRouter.put('/update/:_id',
    auth(),
    multerHost({allowedExtentions: extentions.Images}).single('image'),
    getDocumentByName(Brand),
    authorization(systemRoles.ADMIN),
    errorHandle(controller.updateBrand)
);

brandRouter.delete('/delete/:_id', auth(), authorization(systemRoles.ADMIN), errorHandle(controller.deleteBrand));

brandRouter.get('/list/:name', errorHandle(controller.listBrandsForSpecificSubCategoryOrCategory));

brandRouter.get("/list", errorHandle(controller.listBrandsWithProducts));

export { brandRouter }