import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import systemVariableService from "../../services/systemVariable.service";
import SystemVariableModel from "../../models/systemVariable.model";
import { makeApiResponce } from '../../libraries/responce';

 export default {
     async detail(req, res) {
         try {

             let findSystemVariableModel = await SystemVariableModel.findOne();
             if (!findSystemVariableModel) {
                 const systemVariableModel = new SystemVariableModel();
                 systemVariableModel.reliPortion = '0.00';
                 systemVariableModel.materialSurcharge = '0.00';
                 systemVariableModel.windowsPermitFee = '0.00';
                 systemVariableModel.windowsDeliveryFee = '0.00';
                 systemVariableModel.slidingGlassDoorPermitFee = '0.00';
                 systemVariableModel.slidingGlassDoorDeliveryFee = '0.00';
                 systemVariableModel.interiorDoorPermitFee = '0.00';
                 systemVariableModel.interiorDoorDeliveryFee = '0.00';
                 systemVariableModel.save();
                 let couponResponce = systemVariableModel;
                 let result = makeApiResponce('System Variable Detail', 1, OK, couponResponce);
                 return res.json(result);
             }

             let couponResponce = findSystemVariableModel;
             let result = makeApiResponce('System Variable Detail', 1, OK, couponResponce);
             return res.json(result);
            
         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },

async update(req, res) {
         try {

             const findSystemVariableModel = await SystemVariableModel.findById(req.params.id);
             if (!findSystemVariableModel) {
                 let result = makeApiResponce('System variable not found.', 1, BAD_REQUEST)
                 return res.status(BAD_REQUEST).json(result);
             }
                         // VALIDATE THE REQUEST
            // const {error, value} = systemVariableService.validateUpdateSystemVariableSchema(req.body);
            // if(error && error.details){
            //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
            //     return res.status(BAD_REQUEST).json(result);
            //  }
             
             findSystemVariableModel.reliPortion = req.body.reliPortion;
             findSystemVariableModel.materialSurcharge = req.body.materialSurcharge;
             findSystemVariableModel.windowsPermitFee = req.body.windowsPermitFee;
             findSystemVariableModel.windowsDeliveryFee = req.body.windowsDeliveryFee;
             findSystemVariableModel.slidingGlassDoorPermitFee = req.body.slidingGlassDoorPermitFee;
             findSystemVariableModel.slidingGlassDoorDeliveryFee = req.body.slidingGlassDoorDeliveryFee;
             findSystemVariableModel.interiorDoorPermitFee = req.body.interiorDoorPermitFee;
             findSystemVariableModel.interiorDoorDeliveryFee = req.body.interiorDoorDeliveryFee;
             findSystemVariableModel.save();

            let responce = {
                id: findSystemVariableModel._id
            }
             
            let result = makeApiResponce('System variable updated successfully', 1, OK, responce);
            return res.json(result);
             

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },



};