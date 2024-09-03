import express from 'express';
import { config } from 'dotenv';

import { connectionDB } from './DB/connection.js';
import { disableCouponsCron } from './src/utils/index.js';
import { establishSocketConnection } from './src/utils/index.js';
import { routerHandler } from './router-handler.js';



export const main = () => {
    
//env file 
config();

//instance of express module
const app = express();

//port number 
const port = +process.env.PORT || 5000; 

//routers handling
routerHandler(app);

//database connection
connectionDB();

//cron job
disableCouponsCron();

const server = app.listen(port, () => console.log(`App listening on port ${port}`));

const io = establishSocketConnection(server);   

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

})
}