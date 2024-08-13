import mongoose from "mongoose";


/**
 * connectionDB
 * @exports Function database connection
 * @description connecting to the mongoDB server
 */
export const connectionDB = async ()=> {
    try {
        await  mongoose.connect(process.env.CONNECTION_URL_DB);
        console.log("connected to the database");
    } catch (error) {
        console.log("Error connecting to the database");
    }
}