import { Router } from "express";

import * as controller from "./coupon.controller.js";
import * as middlewares from "../../middlewares/index.js";
import { systemRoles } from "../../utils/index.js";
import { createCouponSchema, updateCouponSchema } from "./coupon.schema.js"; 

const couponRouter = Router();
const { auth, errorHandle, authorization, validationMiddleware } = middlewares;

couponRouter.post("/create", auth(), authorization(systemRoles.ADMIN), validationMiddleware(createCouponSchema), errorHandle(controller.createCoupon));

couponRouter.get("/", auth(), authorization(systemRoles.ADMIN), errorHandle(controller.getAllCoupons));

couponRouter.get("/:_id", auth(), authorization(systemRoles.ADMIN), errorHandle(controller.getCouponById));

couponRouter.put("/update/:couponId", auth(), authorization(systemRoles.ADMIN), validationMiddleware(updateCouponSchema), errorHandle(controller.updateCoupon));



export { couponRouter };