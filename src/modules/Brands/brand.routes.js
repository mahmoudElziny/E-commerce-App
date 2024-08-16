import { Router } from "express";

import * as middlewares from "../../middlewares/index.js";
import * as controller from "./brand.controller.js";    
import { extentions } from "../../utils/index.js";
import { Brand } from "../../../DB/models/index.js";

const { errorHandle, multerHost, getDocumentByName } = middlewares;

const brandRouter = Router();

brandRouter.post('/create',
    multerHost({allowedExtentions: extentions.Images}).single('image'),
    getDocumentByName(Brand),
    errorHandle(controller.createBrand)
);

brandRouter.get('/', errorHandle(controller.getBrand));

brandRouter.put('/update/:_id',
    multerHost({allowedExtentions: extentions.Images}).single('image'),
    getDocumentByName(Brand),
    errorHandle(controller.updateBrand)
);

brandRouter.delete('/delete/:_id', errorHandle(controller.deleteBrand));


export { brandRouter }