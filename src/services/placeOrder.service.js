import Joi from 'joi'
export default {
    validatePlaceOrderInteriorDoorSchema(body){
        const schema = Joi.object().keys({
            openingType: Joi.string(),
            serviceId: Joi.string(),
            serviceName: Joi.string(),
            serviceType: Joi.string(),
            propertyId: Joi.string(),
            roomType: Joi.string(),
            temperedGlassType: Joi.string(),
            floorType: Joi.string(),
            width: Joi.number(),
            height: Joi.number(),
            doorHeight: Joi.number(),
            doorWidth: Joi.number(),
            lockAndKey: Joi.boolean(),
            isFireRated: Joi.boolean(),
            casing: Joi.string(),
            doorType: Joi.string(),
            hardware: Joi.string(),
            coreType: Joi.string(),
            hingeType: Joi.string(),
            unit: Joi.string(),
            openInGarage: Joi.boolean(),
            jamb: Joi.string(),
            jambWidthInches: Joi.number(),
            doorStyle: Joi.string(),
            doorFinish: Joi.string(),
            doorHingColor: Joi.string().valid('Satin Nickle', 'Oil Rubbed Bronze'),
            temperedGlass: Joi.boolean(),
            useMyOwnTrim: Joi.boolean(),
            useMyOwnDoorHandle: Joi.boolean(),
            selectedRoomInfo: Joi.string(),
            doorCasing: Joi.string(),
            useMyOwnCasing: Joi.boolean(),
        });
        const schemas = Joi.array().items(schema);
        const { error, value } = Joi.validate(body, schemas);
        if (error && error.details) {
            return { error };
        }
        return { value };
    },
    validatePlaceOrderWindowSchema(body){
        const schema = Joi.object().keys({
            serviceId: Joi.string(),
            serviceName: Joi.string(),
            serviceType: Joi.string(),
            propertyId: Joi.string(),
            roomType: Joi.string(),
            temperedGlassType: Joi.string(),
            distanceFromGround: Joi.string(),
            color: Joi.string(),
            windowType: Joi.string(),
            stackedWindow: Joi.string(),
            floorType: Joi.string(),
            glassType: Joi.string(),
            gridSelection: Joi.string(),
            width: Joi.number(),
            height: Joi.number(),
            gridColor: Joi.string(),
            privacy: Joi.boolean(),
            grid: Joi.boolean(),
            temperedGlass: Joi.boolean(),
        });
        const schemas = Joi.array().items(schema);
        const { error, value } = Joi.validate(body, schemas);
        if (error && error.details) {
            return { error };
        }
        return { value };
    },
    validatePlaceOrderSlidingDoorSchema(body){
        const schema = Joi.object().keys({
            serviceId: Joi.string(),
            serviceName: Joi.string(),
            serviceType: Joi.string(),
            propertyId: Joi.string(),
            roomType: Joi.string(),
            floorType: Joi.string(),
            openingDirection: Joi.string(),
            width: Joi.number(),
            height: Joi.number(),
            lockAndKey: Joi.boolean(),
            doorType: Joi.string(),
            gridSelection: Joi.string(),
            gridColor: Joi.string(),
            color: Joi.string(),
            grid: Joi.boolean(),
        });
        const { error, value } = Joi.validate(body, schema);
        if (error && error.details) {
            return { error };
        }
        return { value };
    },
};