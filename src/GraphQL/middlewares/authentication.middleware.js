import { ErrorHandlerClass } from "../../utils/index.js";
import { User } from "../../../DB/models/index.js";
import jwt from "jsonwebtoken";


export const isAuthQL = async (token) => {
    try {
        //check if there is token  
        if (!token) {
            return new ErrorHandlerClass({ message: "Please signIn first , there is no token generated", statusCode: 400, position: "at auth api" });
        }

        //check token bearer
        if (!token.startsWith(process.env.TOKEN_PREFEX)) {
            return new ErrorHandlerClass({ message: "Invalid Token", statusCode: 400, position: "at auth api" });
        }

        //remove token bearer to get the original token
        const originalToken = token.split(" ")[1];

        //decode the token by token signature
        let decodedData = jwt.verify(originalToken, process.env.LOGIN_SECRET);


        //findUserId
        const user = await User.findById(decodedData?._id).select("-password");
        
        //check if user logedin 
        if (user.status != "online") {
            return new ErrorHandlerClass({ message: "Invalid Token payload, try login", statusCode: 400, position: "at auth api" });
        }

        //check if the user exists
        if (!user) {
            return new ErrorHandlerClass({ message: "Please signUp and try to login", statusCode: 404, position: "at auth api" });
        }

        return {
            code: 200,
            user
        }

    } catch (error) {
        console.log(error);
        new ErrorHandlerClass("invalid token", 400, "at isAuthQL middleware");

    }
}