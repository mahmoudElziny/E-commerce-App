import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

import { ErrorHandlerClass } from '../utils/index.js';
import { extentions } from '../utils/index.js';

/**
 * multerMiddleware
 * @param {Object} {filePath, allowedExtentions} 
 * @returns {object} file
 * @description middleware to upload files local via multer module
 */
export const multerMiddleware = ({filePath = 'general', allowedExtentions = extentions.Images}={}) => {
    
    //file path to be uploaded 
    const destnationPath = path.resolve(`src/uploads/${filePath}`);

     //if file destnation not exists 
    if(!fs.existsSync(destnationPath)){
        //creating file destnation if not exists
        fs.mkdirSync(destnationPath, {recursive: true});
    }

    //multer store files in diskStorage
    const storage = multer.diskStorage({
        //destination of the file on disk storage
        destination: function (req, file, cb) {
            //pass the file destination to callback function
            cb(null, destnationPath);
        },
        //filename on disk storage
        filename: function (req, file, cb) {
            //create unique File Name (date, random string, originalname) 
            const uniqueFileName = DateTime.now().toFormat('yyyy-MM-dd') + '_' + nanoid(4) + '_' + file.originalname;
            //pass the file name to callback function
            cb(null, uniqueFileName);
        }   
    });

    //file filtration
    const fileFilter = (req, file, cb) => {
        //reject files with extentions other allowed extentions
        if(allowedExtentions?.includes(file.mimetype)){
            return cb(null, true);
        }
        //if error
        cb(new ErrorHandlerClass({message: "Invalid file type , only pdf file allowed", statusCode: 400, position: "at multerMiddleware"}), false);
    }
    
    //assign the multer function with params ( file filtration & storage information ) to const var file 
    const file = multer({ fileFilter, storage});
    //returning multer file to next middleware
    return file; 

}

/**
 * multerMiddleware
 * @param {Object} allowedExtentions 
 * @returns {object} file
 * @description middleware to upload files to host via multer module
 */
export const multerHost = ({allowedExtentions = extentions.Images}={}) => {
    
    //multer store files in diskStorage
    const storage = multer.diskStorage({
        //filename on disk storage
        filename: function (req, file, cb) {
            //create unique File Name (date, random string, originalname) 
            const uniqueFileName = DateTime.now().toFormat('yyyy-MM-dd') + '_' + nanoid(4) + '_' + file.originalname;
            //pass the file name to callback function
            cb(null, uniqueFileName);
        } 
    });

    //file filtration
    const fileFilter = (req, file, cb) => {
        //reject files with extentions other allowed extentions
        if(allowedExtentions?.includes(file.mimetype)){
            return cb(null, true);
        }
        //if error
        cb(new ErrorHandlerClass({message: "Invalid file type , only pdf file allowed", statusCode: 400, position: "at multerMiddleware"}), false);
    }

    //assign the multer function with params ( file filtration & storage information ) to const var file 
    const file = multer({ fileFilter, storage});
        
    //returning multer file to next middleware
    return file;     
}