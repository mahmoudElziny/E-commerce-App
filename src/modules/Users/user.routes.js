import { Router } from "express";

import * as controller from "./user.controller.js";

import * as middlewares from "../../middlewares/index.js";

const userRouter = Router();
const { errorHandle } = middlewares;


userRouter.post("/register", errorHandle(controller.registerUser));

export { userRouter };

