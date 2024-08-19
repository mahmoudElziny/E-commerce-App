import { Router } from "express";

import * as middlewares from "../../middlewares/index.js";
import * as controller from "./sub-categories.controller.js";
import { extentions, systemRoles } from "../../utils/index.js";
import { SubCategory } from "../../../DB/models/index.js";

const { errorHandle, multerHost, getDocumentByName, auth, authorization } = middlewares;

const subCategoryRouter = Router();

subCategoryRouter.post("/create",
    auth(),
    multerHost({allowedExtentions: extentions.Images}).single("image"),
    getDocumentByName(SubCategory),
    authorization(systemRoles.ADMIN),
    errorHandle(controller.createSubCategory));

subCategoryRouter.get("/", errorHandle(controller.getSubCategory));

subCategoryRouter.put("/update/:_id",
    auth(),
    multerHost({allowedExtentions: extentions.Images}).single("image"),
    getDocumentByName(SubCategory),
    authorization(systemRoles.ADMIN),
    errorHandle(controller.updateSubCategory));

subCategoryRouter.delete("/delete/:_id", auth(), authorization(systemRoles.ADMIN), errorHandle(controller.deleteSubCategory)); 

export { subCategoryRouter }