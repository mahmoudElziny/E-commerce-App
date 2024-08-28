import { Server } from "socket.io";


let io = null;
//establish socket connection
export const establishSocketConnection = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
        }
    });
    return io;
}


//return io paremeter
export const getSocket = () => {
    return io;
}