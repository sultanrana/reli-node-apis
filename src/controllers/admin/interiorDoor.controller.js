import Joi from 'joi';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import { makeApiResponce } from '../../libraries/responce';
import InteriorDoorModel from '../../models/interiorDoor.model';

function validate(body) {
    const schema = Joi.object().keys({
        user: Joi.string().hex().length(24).required(),
        service: Joi.string().hex().length(24).required(),
        image: Joi.string().optional(),
        modelName: Joi.string().required(),
        room: Joi.string().optional(),
        floor: Joi.string().optional(),
        grid: Joi.string().optional(),
        doorType: Joi.string().optional(),
        openDirection: Joi.string().optional(),
        size: Joi.string().optional(),
        color: Joi.string().optional(),
        lockAndKey: Joi.string().optional(),
        wallConditionJambWidth: Joi.string().required(),
        jambWidthInches: Joi.number().required(),
        doorWidth: Joi.string().required(),
        doorWidthInches: Joi.number().required(),
        doorHeight: Joi.string().required(),
        doorHeightInches: Joi.number().required(),
        overallFrameWidth: Joi.number().required(),
        overallFrameHeight: Joi.number().required(),
        surface: Joi.string().required(),
        thicknessAndCore: Joi.string().required(),
        doorThickness: Joi.string().required(),
        coreType: Joi.string().required(),
        doorThicknessInches: Joi.number().required(),
        hinges: Joi.number().required(),
        isFireRated: Joi.boolean().required(),
        rsPrice: Joi.string().required(),
    });
    const { error, value } = Joi.validate(body, schema);
    if (error && error.details) {
        return { error };
    }
    return { value };
}
/**
 * add new interior door
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
        const interiorDoorModel = new InteriorDoorModel(value);
        interiorDoorModel.save();
        let response = {
            id: interiorDoorModel._id 
        }
        let result = makeApiResponce('Interior Door Created Successfully', 1, OK, response);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

/**
 * get all interior doors
 * @param {*} req 
 * @param {*} res 
 */
const getAll = async (req, res) => {
    try {
        const data = await InteriorDoorModel.find({});
        let result = makeApiResponce('Interior Door Listing', 1, OK, data);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

/**
 * get one interior door
 * @param {*} req 
 * @param {*} res 
 */
const getOne = async (req, res) => {
    try {
        const data = await InteriorDoorModel.findById(req.params.id);
        let result = makeApiResponce('Interior Door', 1, OK, data);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

/**
 * update interior door
 * @param {*} req 
 * @param {*} res 
 */
const update = async (req, res) => {
    try {
        if (req.files[0]!== undefined) {
            req.image = req.files[0].filename;
        }
        const interiorDoorModel = await InteriorDoorModel.findById(req.params.id);
        if (!interiorDoorModel) {
            let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        const keys = Object.keys(req.body);
        keys.forEach(ele => {
            interiorDoorModel[ele] = req.body[ele];
        })
        interiorDoorModel.save();
        let response = {
            id: interiorDoorModel._id 
        }
        let result = makeApiResponce('Interior Door updated Successfully', 1, OK, response);
        return res.json(result);
    } catch (error) {
        let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        return res.status(BAD_REQUEST).json(result);
    }
}

/**
 * remove interior door
 * @param {*} req 
 * @param {*} res 
 */
const remove = async (req, res) => {
    try {
        const data = await InteriorDoorModel.deleteOne({ _id: req.params.id });
        if (!data) {

            let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        let result = makeApiResponce('Interior Door Removed', 1, OK, data);
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