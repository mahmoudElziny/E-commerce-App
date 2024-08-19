import { Router } from "express";

import { multerHost, auth, authorization } from '../../middlewares/index.js';
import { extentions, systemRoles } from '../../utils/index.js'
import * as controller from './categories.controller.js'
import { errorHandle } from "../../middlewares/index.js";
import { getDocumentByName } from "../../middlewares/index.js";
import { Category } from "../../../DB/models/index.js";

const categoryRouter = Router();

//createCategory
categoryRouter.post("/create",
    auth(),
    multerHost({allowedExtentions: extentions.Images}).single('image'),
    getDocumentByName(Category),
    authorization(systemRoles.ADMIN),
    errorHandle(controller.createCategory) 
);

//getCategory
categoryRouter.get("/", errorHandle(controller.getCategory));

//updateCategory
categoryRouter.put ("/update/:_id",
    auth(),
    multerHost({allowedExtentions: extentions.Images}).single('image'),
    getDocumentByName(Category),
    authorization(systemRoles.ADMIN),
    errorHandle(controller.updateCategory));

//deleteCategory
categoryRouter.delete("/delete/:_id", auth(), authorization(systemRoles.ADMIN), errorHandle(controller.deleteCategory));

categoryRouter.get("/list", errorHandle(controller.listCategories));


export { categoryRouter }