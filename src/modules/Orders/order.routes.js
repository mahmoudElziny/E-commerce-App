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

orderRouter.post("/stripePay/:orderId", auth(), authorization(systemRoles.BUYER), errorHandle(controller.paymentWithStripe));

orderRouter.post("/webhook", errorHandle(controller.stripeWebhookLocal)); 

orderRouter.post("/refund/:orderId", auth(), authorization(systemRoles.BUYER), errorHandle(controller.refundPayment)); 



export { orderRouter };