
import { Router } from "express";

import * as controller from "./review.controller.js";
import * as middlewares from "../../middlewares/index.js";
import { systemRoles } from "../../utils/index.js";


const { auth, errorHandle, authorization } = middlewares;
const reviewRouter = Router();

reviewRouter.post('/add', auth(), authorization(systemRoles.BUYER), errorHandle(controller.addReview));

reviewRouter.get('/', errorHandle(controller.listReviews));

reviewRouter.put('/approve-reject/:reviewId', auth(), authorization(systemRoles.ADMIN), errorHandle(controller.approveOrRejectReview));


export { reviewRouter };



