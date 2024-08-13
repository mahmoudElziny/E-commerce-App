

// error handler class to handle any error extends from Error class in JS
export class ErrorHandlerClass extends Error {
    constructor({message, statusCode, stack, position, data}){
        super(message,stack)
        this.statusCode = statusCode,
        this.position = position ? position : "Error",
        this.data = data ? data : null
    }
}