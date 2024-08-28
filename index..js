import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { Server } from "socket.io";

import { globalResponse } from './src/middlewares/index.js';
import { connectionDB } from './DB/connection.js';
import * as router from './src/modules/index.js';
import { disableCouponsCron } from './src/utils/index.js';
import { establishSocketConnection } from './src/utils/index.js';

//env file 
config();

//instance of express module
const app = express();

//port number 
const port = +process.env.PORT || 5000;

//cors
app.use(cors());

//database connection
connectionDB(); 

//cron job
disableCouponsCron();

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


const server = app.listen(port, () => console.log(`App listening on port ${port}`));

const io = establishSocketConnection(server);   

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

})