import { Router } from "express";

import * as controller from "./order.controller.js";
import * as middlewares from "../../middlewares/index.js";
import { systemRoles } from "../../utils/index.js";

const orderRouter = Router();
const { auth, errorHandle, authorization, validationMiddleware } = middlewares;

orderRouter.post("/create", auth(), authorization(systemRoles.BUYER), errorHandle(controller.createOrder));

orderRouter.put("/cancel/:orderId", auth(), authorization(systemRoles.BUYER), errorHandle(controller.cancelOrder));

orderRouter.put("/delivered/:orderId", auth(), errorHandle(controller.deliveredOrder));

orderRouter.get("/", auth(), authorization(systemRoles.BUYER), errorHandle(controller.listOrders));



export { orderRouter };