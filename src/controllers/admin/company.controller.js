import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import bcryptjs from 'bcryptjs';
import UserModel from "../../models/user.model";
import CompanyModel from "../../models/company.model";
import { makeApiResponce } from '../../libraries/responce';

export default {

// async listing(req, res) {
//     try {
//         await  CompanyModel.find({"userType": "admin"}, function(err, users) {
//             if (err) {
//                 let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
//                 return res.status(INTERNAL_SERVER_ERROR).json(result)
//             } else {
//                 let userRecord = [];
//                 users.forEach((doc) => {
//                     userRecord.push({
//                         id: doc._id,
//                         firstName: doc.firstName,
//                         lastName: doc.lastName,
//                         email: doc.email,
//                         userType: doc.userType,
//                         statusBit: doc.statusBit
//                     });
//                 });
//                 let couponResponce = userRecord;
//                 let result = makeApiResponce('User Listing', 1, OK, couponResponce);
//                 return res.json(result);
//             }
//         })

//     }catch(err){
//         console.log(err);
//         let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
//         return res.status(INTERNAL_SERVER_ERROR).json(result)
//     }
// },
    
    async listing(req, res){
        try{
            
            let getCompany =  await CompanyModel.find({});
            if(!getCompany){
                let result = makeApiResponce('Empty list company', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let result = makeApiResponce('Company Listing', 1, OK, getCompany);
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

            const existingUser = await CompanyModel.findOne({ representativeEmail: req.body.representativeEmail });
            if (existingUser) {
                let result = makeApiResponce('Email is Already Exsit', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            
            // const user = new UserModel();
            // user.email = req.body.representativeEmail;
            // user.firstName = req.body.representativeName;
            // user.userType = 'contractor admin';
            // const hash = await getEncryptedPassword('12345678');
            // user.password = hash;
            // await user.save();

            const company = new CompanyModel();
            company.companyName = req.body.companyName;
            company.addressOne = req.body.addressOne;
            company.addressTwo = req.body.addressTwo;
            company.companyStatus = req.body.companyStatus;
            company.distanceWillingTravel = req.body.distanceWillingTravel;
            company.representativeName = req.body.representativeName;
            company.representativeNumber = req.body.representativeNumber;
            company.representativeEmail = req.body.representativeEmail;
            company.services = req.body.services;
            company.image = image;
            await company.save();

            let responce = {
                id: company._id
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

            const findCompany = await CompanyModel.findById(req.params.id);
            if (!findCompany) {
                let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let image='';
            if (req.files[0]!== undefined) {
                image = req.files[0].filename;
            }

            findCompany.companyName = req.body.companyName;
            findCompany.addressOne = req.body.addressOne;
            findCompany.addressTwo = req.body.addressTwo;
            findCompany.companyStatus = req.body.companyStatus;
            findCompany.distanceWillingTravel = req.body.distanceWillingTravel;
            findCompany.representativeName = req.body.representativeName;
            findCompany.representativeNumber = req.body.representativeNumber;
            findCompany.services = req.body.services;
            if (req.files[0]!== undefined) {
                findCompany.image = image;
            }
            await findCompany.save();

            let responce = {
                id: findCompany._id
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

            const findCompany = await CompanyModel.findById(req.params.id);
            if (!findCompany) {
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('User Detail', 1, OK, findCompany);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async delete(req, res) {
        try {
            const findCompany = await CompanyModel.findById(req.params.id);
            if (!findCompany) {
                let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const deleteCompany = await CompanyModel.deleteOne({ _id: req.params.id });
            if (!deleteCompany) {
                let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let responce = {};
            let result = makeApiResponce('Delete Successfully', 1, OK, responce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

};