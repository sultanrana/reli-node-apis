import Joi from 'joi';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import { makeApiResponce } from '../../libraries/responce';
import DoorCasingModel from '../../models/doorCasing.model';

function validate(body) {
    const schema = Joi.object().keys({
        style: Joi.string().optional(),
        doorType: Joi.string().optional(),
        height: Joi.string().optional(),
        size: Joi.string().optional(),
        rPrice: Joi.string().optional(),
    });
    const { error, value } = Joi.validate(body, schema);
    if (error && error.details) {
        return { error };
    }
    return { value };
}
/**
 * add new Door casing
 * @param {*} req 
 * @param {*} res   
 */
const add = async (req, res) => {
    try {
        if (req.files[0]!== undefined) {
            req.image = req.files[0].filename;
        }
        const {error, value} = validate(req.body);
        if(error && error.details){
            let result = makeApiResponce(error.message, 0, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        const DoorCasingModel = new DoorCasingModel(value);
        DoorCasingModel.save();
        let response = {
            id: DoorCasingModel._id 
        }
        let result = makeApiResponce('Door casing Created Successfully', 1, OK, response);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

/**
 * get all Door casings
 * @param {*} req 
 * @param {*} res 
 */
const getAll = async (req, res) => {
    try {
        const data = await DoorCasingModel.find({});
        let result = makeApiResponce('Door casing Listing', 1, OK, data);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

/**
 * get one Door casing
 * @param {*} req 
 * @param {*} res 
 */
const getOne = async (req, res) => {
    try {
        const data = await DoorCasingModel.findById(req.params.id);
        let result = makeApiResponce('Door casing', 1, OK, data);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

/**
 * update Door casing
 * @param {*} req 
 * @param {*} res 
 */
const update = async (req, res) => {
    try {
        if (req.files[0]!== undefined) {
            req.image = req.files[0].filename;
        }
        const DoorCasingModel = await DoorCasingModel.findById(req.params.id);
        if (!DoorCasingModel) {
            let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        const keys = Object.keys(req.body);
        keys.forEach(ele => {
            DoorCasingModel[ele] = req.body[ele];
        })
        DoorCasingModel.save();
        let response = {
            id: DoorCasingModel._id 
        }
        let result = makeApiResponce('Door casing updated Successfully', 1, OK, response);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

/**
 * remove Door casing
 * @param {*} req 
 * @param {*} res 
 */
const remove = async (req, res) => {
    try {
        const data = await DoorCasingModel.deleteOne({ _id: req.params.id });
        if (!data) {

            let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        let result = makeApiResponce('Door casing Removed', 1, OK, data);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

export default {
    add,
    getAll,
    getOne,
    update,
    remove
}