import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import StaffModel from "../../models/staff.model";
import { makeApiResponce } from '../../libraries/responce';

 export default {
    async listing(req, res){
        try{
            
            let getStaff =  await StaffModel.find({});
            if(!getStaff){
                let result = makeApiResponce('Empty list coupon', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Coupon Listing', 1, OK, getStaff);
            return res.json(result);

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
                
                const existingUser = await StaffModel.findOne({ email: req.body.email });
                if (existingUser) {
                    let result = makeApiResponce('Email is Already Exsit', 1, BAD_REQUEST)
                    return res.status(BAD_REQUEST).json(result);
                }
                
                const staffModel = new StaffModel();
                staffModel.comapny = req.body.comapny;
                staffModel.name = req.body.name;
                staffModel.email = req.body.email;
                staffModel.phone = req.body.phone;
                staffModel.approvedByReli = req.body.approvedByReli;
                staffModel.accountType = req.body.accountType;
                staffModel.status = req.body.status;
                staffModel.image = image;
                staffModel.save();
                let responce = {
                    id: staffModel._id 
                }
                let result = makeApiResponce('Successfully', 1, OK, responce);
                return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async update(req, res) {
         try {

             const findStaff = await StaffModel.findById(req.params.id);
             if (!findStaff) {
                 let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
                 return res.status(BAD_REQUEST).json(result);
             }

             let image='';
             if (req.files[0]!== undefined) {
                 image = req.files[0].filename;
             }
                         
            findStaff.comapny = req.body.comapny;
            findStaff.name = req.body.name;
            findStaff.phone = req.body.phone;
            findStaff.approvedByReli = req.body.approvedByReli;
            findStaff.accountType = req.body.accountType;
            findStaff.status = req.body.status;
            if (req.files[0]!== undefined) {
                findStaff.image = image;
            }
            findStaff.save();
            let responce = {
                    id: findStaff._id
            }
            
            let result = makeApiResponce('Successfully', 1, OK, responce);
            return res.json(result);

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },

    async detail(req, res) {
        try {
             
             const findStaff = await StaffModel.findById(req.params.id);
             if (!findStaff) {
                 let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
                 return res.status(BAD_REQUEST).json(result);
             }
             let result = makeApiResponce('Detail', 1, OK, findStaff);
             return res.json(result);

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },

     async delete(req, res) {
             try {
                 const findStaff = await StaffModel.findById(req.params.id);
                 if (!findStaff) {
                     let result = makeApiResponce('Coupon not found.', 1, BAD_REQUEST)
                     return res.status(BAD_REQUEST).json(result);
                 }

                 const deleteStaff = await StaffModel.deleteOne({ _id: req.params.id });
                 if (!deleteStaff) {
                     let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
                     return res.status(BAD_REQUEST).json(result);
                 }

                 let userResponce = {};
                 let result = makeApiResponce('Successfully', 1, OK, userResponce);
                 return res.json(result);

             }catch(err){
                 console.log(err);
                 let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                 return res.status(INTERNAL_SERVER_ERROR).json(result)
             }
     },

};