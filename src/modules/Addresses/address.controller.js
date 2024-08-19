
import axios from "axios";

import { Address } from "../../../DB/models/index.js";
import { ErrorHandlerClass } from "../../utils/error-class.utils.js";


/**
 * @api {post} /addresses Add new address 
 */
export const addAdress = async (req, res, next) => {
    const { country, city, postalCode, buildingNumber, floorNumber, addressLabel, setAsDefault } = req.body;
    const userId = req.authUser._id;
    
    //city validation
    const cities = await axios.get(`https://api.api-ninjas.com/v1/city?country=EG&limit=30`,{
        headers: {
            'X-Api-Key': process.env.CITY_API_KEY,
        }
    });
    const isCityExists = cities.data.find(c => c.name === city);
    if(!isCityExists) return next(new ErrorHandlerClass({message: "City not found", statusCode: 404, position: "at addAdress api"}));

    const newAddress = new Address({
        userId,
        country,city, postalCode, buildingNumber, floorNumber, addressLabel,
        isDefault: [true, false].includes(setAsDefault)? setAsDefault : false,
        });

        if(newAddress.isDefault){
            await Address.updateOne({userId, isDefault: true}, {isDefault: false});
        }

    const address = await newAddress.save();
    return res.status(201).json({ message: "Address added successfully", address });
}

/**
 * @api {put} /addresses/update/:_id update address by id 
 */
export const updateAddress = async (req, res, next) => {
    const { country, city, postalCode, buildingNumber, floorNumber, addressLabel, setAsDefault } = req.body;
    const userId = req.authUser._id;
    const addressId = req.params._id;

    const address = await Address.findOne({_id: addressId, userId, isMarkedAsDeleted: false});
    if(!address){
        return next(new ErrorHandlerClass({message: "Address not found", statusCode: 404, position: "at updateAddress api"}));
    }

    if(country) address.country = country;
    if(city) address.city = city;
    if(postalCode) address.postalCode = postalCode;
    if(buildingNumber) address.buildingNumber = buildingNumber;
    if(floorNumber) address.floorNumber = floorNumber;
    if(addressLabel) address.addressLabel = addressLabel;
    if([true, false].includes(setAsDefault)) {
        address.isDefault = [true, false].includes(setAsDefault)? setAsDefault : false;
        await Address.updateOne({userId, isDefault: true}, {isDefault: false});
    }

    await address.save();
    return res.status(201).json({ message: "Address updated successfully", address });
}

/**
 * @api {delete} /addresses/delete/:_id delete address by id 
 */
export const deleteAddress = async (req, res, next) => {
    const addressId = req.params._id;
    const userId = req.authUser._id;

    const address = await Address.findOneAndUpdate({
        _id: addressId, userId, isMarkedAsDeleted: false},
        {isMarkedAsDeleted: true, isDefault: false},
        {new: true});

    if(!address){
        return next(new ErrorHandlerClass({message: "Address not found", statusCode: 404, position: "at deleteAddress api"}));
    }    

    res.status(200).json({ message: "Address deleted successfully", address });
}   

/**
 * @api {get} /addresses get all addresses
 */
export const getAllAddresses = async (req, res, next) => {
    const userId = req.authUser._id;
    const addresses = await Address.find({userId, isMarkedAsDeleted: false}); 
    res.status(202).json({message: "Addresses found successfully", addresses});
}