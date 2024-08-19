import { Router } from "express";

import * as controller from "./address.controller.js";
import * as middlewares from "../../middlewares/index.js";
import { systemRoles } from "../../utils/index.js";


const addressRouter = Router();
const { auth, errorHandle, authorization } = middlewares;

addressRouter.post("/add", auth(), authorization(systemRoles.BUYER), errorHandle(controller.addAdress));

addressRouter.put("/update/:_id", auth(), authorization(systemRoles.BUYER), errorHandle(controller.updateAddress));

addressRouter.put("/delete/:_id", auth(), authorization(systemRoles.BUYER), errorHandle(controller.deleteAddress));

addressRouter.get("/", auth(), authorization(systemRoles.BUYER), errorHandle(controller.getAllAddresses));



export { addressRouter };