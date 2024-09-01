import { Router } from "express";

import * as controller from "./user.controller.js";

import * as middlewares from "../../middlewares/index.js";

const userRouter = Router();
const { errorHandle, auth } = middlewares;


userRouter.post("/register", errorHandle(controller.registerUser));
userRouter.get("/verify-email", errorHandle(controller.verifyEmail));
userRouter.patch("/signIn", errorHandle(controller.signIn));
userRouter.post("/loginWithGmail", errorHandle(controller.loginWithGmail));
userRouter.post("/signUpWithGmail", errorHandle(controller.signUpWithGmail));
userRouter.put("/updateAccount", auth(), errorHandle(controller.updateAccount));
userRouter.put("/deleteAccount", auth(), errorHandle(controller.deleteAccount));
userRouter.get("/", auth(), errorHandle(controller.getAccount));
userRouter.patch("/updatePassword", auth(), errorHandle(controller.updatePassword));
userRouter.get("/forgetPassword", errorHandle(controller.forgetPassword));
userRouter.patch("/reset-password", errorHandle(controller.resetPassword));




export { userRouter };

