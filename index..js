import express from 'express';
import { config } from 'dotenv';

import { globalResponse } from './src/middlewares/index.js';
import { connectionDB } from './DB/connection.js';
import * as router from './src/modules/index.js';

//env file 
config();

//instance of express module
const app = express();

//port number 
const port = +process.env.PORT || 5000;

//database connection
connectionDB(); 

//middleware function to parse incoming JSON data from HTTP requests
app.use(express.json());

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


//global responce error handler middleware
app.use(globalResponse);


app.listen(port, () => console.log(`App listening on port ${port}`));
