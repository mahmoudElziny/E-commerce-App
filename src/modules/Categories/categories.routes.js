import { Router } from "express";

import { multerHost } from '../../middlewares/index.js';
import { extentions } from '../../utils/index.js'
import * as controller from './categories.controller.js'
import { errorHandle } from "../../middlewares/index.js";
import { getDocumentByName } from "../../middlewares/index.js";
import { Category } from "../../../DB/models/index.js";

const categoryRouter = Router();

//createCategory
categoryRouter.post("/create",
    multerHost({allowedExtentions: extentions.Images}).single('image'),
    getDocumentByName(Category),
    errorHandle(controller.createCategory) 
);

//getCategory
categoryRouter.get("/", errorHandle(controller.getCategory));

//updateCategory
categoryRouter.put ("/update/:_id",
    multerHost({allowedExtentions: extentions.Images}).single('image'),
    getDocumentByName(Category),
    errorHandle(controller.updateCategory));

//deleteCategory
categoryRouter.delete("/delete/:_id", errorHandle(controller.deleteCategory));

categoryRouter.get("/list", errorHandle(controller.listCategories));


export { categoryRouter }