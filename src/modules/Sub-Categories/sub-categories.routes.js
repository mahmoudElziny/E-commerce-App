import { Router } from "express";

import * as middlewares from "../../middlewares/index.js";
import * as controller from "./sub-categories.controller.js";
import { extentions } from "../../utils/index.js";
import { SubCategory } from "../../../DB/models/index.js";

const { errorHandle, multerHost, getDocumentByName } = middlewares;

const subCategoryRouter = Router();

subCategoryRouter.post("/create",
    multerHost({allowedExtentions: extentions.Images}).single("image"),
    getDocumentByName(SubCategory),
    errorHandle(controller.createSubCategory));

subCategoryRouter.get("/", errorHandle(controller.getSubCategory));

subCategoryRouter.put("/update/:_id",
    multerHost({allowedExtentions: extentions.Images}).single("image"),
    getDocumentByName(SubCategory),
    errorHandle(controller.updateSubCategory));

subCategoryRouter.delete("/delete/:_id", errorHandle(controller.deleteSubCategory)); 

export { subCategoryRouter }