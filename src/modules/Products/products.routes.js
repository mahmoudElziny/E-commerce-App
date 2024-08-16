import { Router } from "express";

import * as middlewares from "../../middlewares/index.js";
import * as controller from "./products.controller.js";    
import { extentions } from "../../utils/index.js";
import { Brand } from "../../../DB/models/brand.model.js";

const { errorHandle, multerHost, checkIfIdExists } = middlewares;

const productRouter = Router();

productRouter.post("/add",
    multerHost({allowedExtentions: extentions.Images}).array("images", 5),   
    checkIfIdExists(Brand),   
    errorHandle(controller.addProduct)
);

productRouter.put("/update/:_id", errorHandle(controller.updateProduct));

productRouter.get("/list", errorHandle(controller.listProducts));

export { productRouter }