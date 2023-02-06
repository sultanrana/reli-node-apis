import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import ServiceModel from "../../models/service.model";
import { makeApiResponce } from '../../libraries/responce';

 export default {
     async listing(req, res) {
         try {
             await  ServiceModel.find({}, function(err, services) {
                 if (err) {
                     let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                     return res.status(INTERNAL_SERVER_ERROR).json(result)
                 } else {
                     const url = req.protocol + '://' + req.get('host')
                     let serviceRecord = [];
                     services.forEach((doc) => {
                        serviceRecord.push({
                             id: doc._id,
                             name: doc.name,
                             image :url + "/src/uploads/images/couponImage/"+doc.image
                         });
                     });
                     let serviceResponce = serviceRecord;
                     let result = makeApiResponce('service Listing', 1, OK, serviceResponce);
                     return res.json(result);
                 }
             })

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
    },
     
    async add(req, res) {
        try {
                        let image='';
                        if (req.files[0]!== undefined) {
                            image = req.files[0].filename;
                        }
                        
                        const serviceModel = new ServiceModel();
                        serviceModel.name = req.body.name;
                        serviceModel.image = image;
                        serviceModel.save();
                        let serviceResponce = {
                            id: serviceModel._id 
                        }
                        let result = makeApiResponce('service Created Successfully', 1, OK, serviceResponce);
                        return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async update(req, res) {
         try {

             const findService = await ServiceModel.findById(req.params.id);
             if (!findCoupon) {
                 let result = makeApiResponce('service not found.', 1, BAD_REQUEST)
                 return res.status(BAD_REQUEST).json(result);
             }

             let image='';
             if (req.files[0]!== undefined) {
                 image = req.files[0].filename;
             }
                    findService.name = req.body.name;
                    if (req.files[0]!== undefined) {
                        findService.image = image;
                    }
                    findService.save();
                let serviceResponce = {
                        id: findService._id
                }
                
                let result = makeApiResponce('service updated successfully', 1, OK, serviceResponce);
                    return res.json(result);

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },

     
    async detail(req, res) {
         try {

             const findService = await ServiceModel.findById(req.params.id);
             if (!findService) {
                 let result = makeApiResponce('Service not found.', 1, BAD_REQUEST)
                 return res.status(BAD_REQUEST).json(result);
             }
             const url = req.protocol + '://' + req.get('host');
             let serviceResponce = {
                 id: findService._id,
                 name: findService.name,
                 image :url + "/src/uploads/images/couponImage/"+findService.image
             }
             let result = makeApiResponce('Service Detail', 1, OK, serviceResponce);
             return res.json(result);

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },

     async delete(req, res) {
             try {
                 const findService = await ServiceModel.findById(req.params.id);
                 if (!findService) {
                     let result = makeApiResponce('service not found.', 1, BAD_REQUEST)
                     return res.status(BAD_REQUEST).json(result);
                 }

                 const deleteService = await ServiceModel.deleteOne({ _id: req.params.id });
                 if (!deleteService) {
                     let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
                     return res.status(BAD_REQUEST).json(result);
                 }

                 let responce = {};
                 let result = makeApiResponce('service Delete Successfully', 1, OK, responce);
                 return res.json(result);

             }catch(err){
                 console.log(err);
                 let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                 return res.status(INTERNAL_SERVER_ERROR).json(result)
             }
     },

};