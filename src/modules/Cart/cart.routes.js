import { Router } from "express";

import * as controller from "./cart.controller.js";
import * as middlewares from "../../middlewares/index.js";
import { systemRoles } from "../../utils/index.js";


const cartRouter = Router();
const { auth, errorHandle, authorization } = middlewares;

cartRouter.post("/add/:productId", auth(), authorization(systemRoles.BUYER), errorHandle(controller.addToCart));

cartRouter.put('/remove/:productId', auth(), authorization(systemRoles.BUYER), errorHandle(controller.removeFromCart));

cartRouter.put('/update/:productId', auth(), authorization(systemRoles.BUYER), errorHandle(controller.updateCart));

cartRouter.get('/', auth(), authorization(systemRoles.BUYER), errorHandle(controller.getCart));







export { cartRouter };