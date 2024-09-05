import { json } from "express";
import cors from "cors";
import * as router from './src/modules/index.js';
import { globalResponse } from './src/middlewares/index.js';
import { createHandler } from "graphql-http/lib/use/express";
import { mainSchema } from "./src/GraphQL/schema/index.js";



export const routerHandler = (app) => {
    
//cors
app.use(cors());
//middleware function to parse incoming JSON data from HTTP requests
app.use(json());


//GraphQL router
app.use('/graphql', createHandler({schema: mainSchema}));

//REST API
//product router 
app.use("/product", router.productRouter);
//brand router 
app.use("/brand", router.brandRouter);
//category router 
app.use("/category", router.categoryRouter);
//subCategory router 
app.use("/subCategory", router.subCategoryRouter);
//user router
app.use("/user", router.userRouter);
//address router
app.use("/address", router.addressRouter);
//cart router
app.use("/cart", router.cartRouter);
//coupon router
app.use("/coupon", router.couponRouter);
//order router
app.use("/order", router.orderRouter);
//review router
app.use("/review", router.reviewRouter);
//if any route
app.use("*", (req, res, next) => {
    res.status(404).json({ message: "Route Not found" });
});

//global responce error handler middleware
app.use(globalResponse);
}