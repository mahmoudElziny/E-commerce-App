import { Router } from "express";

import * as middlewares from "../../middlewares/index.js";
import * as controller from "./products.controller.js";    
import { extentions, systemRoles } from "../../utils/index.js";
import { Brand } from "../../../DB/models/brand.model.js";

const { errorHandle, multerHost, checkIfIdExists, auth, authorization} = middlewares;

const productRouter = Router();

productRouter.post("/add",
    auth(),
    multerHost({allowedExtentions: extentions.Images}).array("images", 5),   
    checkIfIdExists(Brand),   
    authorization(systemRoles.ADMIN),
    errorHandle(controller.addProduct)
);

productRouter.put("/update/:_id", auth(), authorization(systemRoles.ADMIN), errorHandle(controller.updateProduct));

productRouter.delete("/delete/:_id", auth(), authorization(systemRoles.ADMIN), errorHandle(controller.deleteProduct));

productRouter.get("/list", errorHandle(controller.listProducts));

export { productRouter }