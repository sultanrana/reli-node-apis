import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import bcryptjs from 'bcryptjs';
import UserModel from "../../models/user.model";
import StaffModel from "../../models/staff.model";
import CompanyModel from "../../models/company.model";
import { makeApiResponce } from '../../libraries/responce';
import PropertyModel from "../../models/property.model";
import OrderModel from "../../models/order.model";
import OrderDetailModel from "../../models/orderDetail.model";

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

            let getCompanies =  await CompanyModel.find({});
            if(!getCompanies){
                let result = makeApiResponce('Empty list company', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // let result = makeApiResponce('Company Listing', 1, OK, getCompany);
            // return res.json(result);

            let companyRecord = [];
            const url = req.protocol + '://' + req.get('host')
            await Promise.all(getCompanies.map(async (doc) => {
                let numberOfUsers =  await UserModel.countDocuments({company : doc._id},(count)=>count);
                let numberOfStaffs =  await StaffModel.countDocuments({company : doc._id},(count)=>count);
                let numberOfTotalUsers = numberOfUsers + numberOfStaffs;
                let numberOfOpenProjects =  await OrderModel.countDocuments({company : doc._id,orderStatus: { "$ne": 'Completed' }},(count)=>count);
                let numberOfCompletedProjects =  await OrderModel.countDocuments({company : doc._id,orderStatus:'Completed'},(count)=>count);

                companyRecord.push({
                    id: doc._id,
                    companyName: doc.companyName,
                    addressOne: doc.addressOne,
                    addressTwo: doc.addressTwo,
                    companyStatus: doc.companyStatus,
                    numberOfUsers:numberOfTotalUsers,
                    numberOfOpenProjects:numberOfOpenProjects,
                    numberOfCompletedProjects:numberOfCompletedProjects,
                    distanceWillingTravel: doc.distanceWillingTravel,
                    representativeName: doc.representativeName,
                    representativeNumber:doc.representativeNumber,
                    representativeEmail: doc.representativeEmail,
                    services: doc.services,
                    image :url + "/src/uploads/images/"+doc.image,
                    statusBit:doc.statusBit,
                    delBit: doc.delBit,

                });

               // console.log(customerRecord)
            }));
            let companyRecordResponce = companyRecord;
            let result = makeApiResponce('Company Listing', 1, OK, companyRecordResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }


        // try{
        //
        //     let getCompany =  await CompanyModel.find({});
        //     if(!getCompany){
        //         let result = makeApiResponce('Empty list company', 1, BAD_REQUEST)
        //         return res.status(BAD_REQUEST).json(result);
        //     }
        //
        //     let result = makeApiResponce('Company Listing', 1, OK, getCompany);
        //     return res.json(result);
        //
        // }catch(err){
        //     console.log(err);
        //     let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
        //     return res.status(INTERNAL_SERVER_ERROR).json(result)
        // }
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
                let result = makeApiResponce('Company not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }


              const contractorsList =await UserModel.find({company : findCompany._id,userType:'contractor'}).select('_id');

              const contractorsListArr = [];
                   await contractorsList.map((contractor)=>{
                          contractorsListArr.push(contractor._id);
                   })



            // let dateArr = req.body.dateSelection.split(",");
            // newOrderModel.dateSelection = dateArr;


            // let getCompletedOrders = await OrderModel.find({orderStatus:'Completed',requestStatus:'Accepted',dateSelection: { $elemMatch: {$eq: todayDate}}});

            //   let ntr = await OrderModel.find({user: {'$in' : contractorsListArr}})
            // console.log(ntr);
            //        return ;

            const url = req.protocol + '://' + req.get('host')
                // let activeProjects  = await OrderModel.aggregate(
                // [
                //     {
                //         $match: {orderStatus: { "$ne": 'Completed' }}
                //     },
                //     {
                //         $lookup:
                //             {
                //                 from: 'orderaccepteds',
                //                 localField: '_id',
                //                 foreignField: 'order',
                //                 "pipeline": [
                //                     {
                //                         $match: {user: {'$in' : contractorsListArr}}
                //                     },
                //                     {"$project": {"user": 1, "statusBit": 1}}
                //                 ],
                //                 as: 'orderaccepteds',
                //             },
                //     },
                //     {
                //         $unwind: '$orderaccepteds'
                //     },
                //     {
                //         $sort: { createdAt: -1 }
                //     }
                //
                // ]
                //  );





                   // await OrderModel.find({company : findCompany._id,orderStatus: { "$ne": 'Completed' }});

            // let completedProjects   = await OrderModel.aggregate(
            //     [
            //         {
            //             $match: {orderStatus:'Completed'}
            //         },
            //         {
            //             $lookup:
            //                 {
            //                     from: 'orderaccepteds',
            //                     localField: '_id',
            //                     foreignField: 'order',
            //                     "pipeline": [
            //                         {
            //                             $match: {user: {'$in' : contractorsListArr}}
            //                         },
            //                         {"$project": {"user": 1, "statusBit": 1}}
            //                     ],
            //                     as: 'orderaccepteds',
            //                 },
            //         },
            //         {
            //             $unwind: '$orderaccepteds'
            //         },
            //         {
            //             $sort: { createdAt: -1 }
            //         }
            //     ]
            //   );

            // let activeProjectsRecord = []
            // await Promise.all(activeProjects.map(async (activeProject) => {
            //        let orderDetail = await OrderDetailModel.find({order:activeProject._id}).populate('property').populate('service').sort({'createdAt': -1})
            //
            //     let data= {
            //         _id: activeProject._id,
            //         orderAccepted: activeProject.orderaccepteds,
            //         name: activeProject.name,
            //         email: activeProject.email,
            //         cardHolderName:activeProject.cardHolderName,
            //         cardlast4: activeProject.cardlast4,
            //         cardExpMonth: activeProject.cardExpMonth,
            //         cardExpYear: activeProject.cardExpYear,
            //         stripePaymentId: activeProject.stripePaymentId,
            //         subTotalAmount: activeProject.subTotalAmount,
            //         discountAmount: activeProject.discountAmount,
            //         totalAmount: activeProject.totalAmount,
            //         orderdetails:orderDetail,
            //     }
            //
            //     activeProjectsRecord.push(data);
            //
            // }));



            // let completedProjectsRecord = []
            // await Promise.all(completedProjects.map(async (completedProject) => {
            //     let orderDetail = await OrderDetailModel.find({order:completedProject._id}).populate('property').populate('service').sort({'createdAt': -1})
            //
            //     let data= {
            //         _id: completedProject._id,
            //         orderAccepted: completedProject.orderaccepteds,
            //         name: completedProject.name,
            //         email: completedProject.email,
            //         cardHolderName:completedProject.cardHolderName,
            //         cardlast4: completedProject.cardlast4,
            //         cardExpMonth: completedProject.cardExpMonth,
            //         cardExpYear: completedProject.cardExpYear,
            //         stripePaymentId: completedProject.stripePaymentId,
            //         subTotalAmount: completedProject.subTotalAmount,
            //         discountAmount: completedProject.discountAmount,
            //         totalAmount: completedProject.totalAmount,
            //         orderdetails:orderDetail,
            //     }
            //
            //     completedProjectsRecord.push(data);
            //
            // }));

            let activeProjects = await OrderModel.aggregate([
                {
                    $match: {orderStatus: { "$ne": 'Completed' }}
                },
                {
                    $lookup: {
                        from: "orderdetails",
                        localField: "_id",
                        foreignField: "order",
                        as: "orderdetails",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "properties",
                                    localField: "property",
                                    foreignField: "_id",
                                    as: "property"
                                },
                            },
                            // { $unwind: "$property" }, mondatroy
                            { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
                            {
                                $lookup: {
                                    from: "services",
                                    localField: "service",
                                    foreignField: "_id",
                                    as: "service"
                                },
                            },
                            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },

                            // {
                            //     $unwind: "$property" if mandatory
                            // }
                        ],
                    }
                },
                // {
                //     $unwind: "$orderdetails"
                // },
                {
                    $lookup:
                        {
                            from: 'orderaccepteds',
                            localField: '_id',
                            foreignField: 'order',
                            "pipeline": [
                                {
                                    $match: {user: {'$in' : contractorsListArr}}
                                },
                                {"$project": {"user": 1, "statusBit": 1}}
                            ],
                            as: 'orderaccepteds',
                        },
                },
                {
                    $unwind: '$orderaccepteds'
                },

            ]);





            let completedProjects  = await OrderModel.aggregate([
                {
                    $match: {orderStatus:'Completed'}
                },
                {
                $lookup: {
                    from: "orderdetails",
                    localField: "_id",
                    foreignField: "order",
                    as: "orderdetails",
                    pipeline: [
                        {
                            $lookup: {
                                from: "properties",
                                localField: "property",
                                foreignField: "_id",
                                as: "property"
                            },
                        },
                       // { $unwind: "$property" }, mondatroy
                        { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "services",
                                localField: "service",
                                foreignField: "_id",
                                as: "service"
                            },
                        },
                        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },

                        // {
                        //     $unwind: "$property" if mandatory
                        // }
                    ],
                }
               },
                // {
                //     $unwind: "$orderdetails"
                // },
                {
                    $lookup:
                        {
                            from: 'orderaccepteds',
                            localField: '_id',
                            foreignField: 'order',
                            "pipeline": [
                                {
                                    $match: {user: {'$in' : contractorsListArr}}
                                },
                                {"$project": {"user": 1, "statusBit": 1}}
                            ],
                            as: 'orderaccepteds',
                        },
                },
                {
                    $unwind: '$orderaccepteds'
                },

                ]);

            //   await OrderModel.find({company : findCompany._id,orderStatus:'Completed'});
            let companyRecord = [];
                companyRecord.push({
                    id: findCompany._id,
                    companyName: findCompany.companyName,
                    addressOne: findCompany.addressOne,
                    addressTwo: findCompany.addressTwo,
                    companyStatus: findCompany.companyStatus,
                    activeProjects:activeProjects,
                    completedProjects:completedProjects,
                    distanceWillingTravel: findCompany.distanceWillingTravel,
                    representativeName: findCompany.representativeName,
                    representativeNumber:findCompany.representativeNumber,
                    representativeEmail: findCompany.representativeEmail,
                    services: findCompany.services,
                    image :url + "/src/uploads/images/"+findCompany.image,
                    statusBit:findCompany.statusBit,
                    delBit: findCompany.delBit,

                });
            let companyRecordResponce = companyRecord;
            let result = makeApiResponce('Company Detail', 1, OK, companyRecordResponce);
            return res.json(result);


            // let result = makeApiResponce('Company Detail', 1, OK, findCompany);
            // return res.json(result);

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

    async companyDetail(req, res){
        try{
            
            let findCompany = await CompanyModel.findById(req.params.id);
            const contractorsList = await UserModel.find({company : findCompany._id,userType:'contractor'}).select('_id');
            const contractorsListArr = [];
                   await contractorsList.map((contractor)=>{
                          contractorsListArr.push(contractor._id);
                   });

            let activeProjects = await OrderModel.aggregate([
                {
                    $match: {orderStatus: { "$ne": 'Completed' }}
                },
                {
                    $lookup: {
                        from: "orderdetails",
                        localField: "_id",
                        foreignField: "order",
                        as: "orderdetails",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "properties",
                                    localField: "property",
                                    foreignField: "_id",
                                    as: "property"
                                },
                            },
                            { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
                            {
                                $lookup: {
                                    from: "services",
                                    localField: "service",
                                    foreignField: "_id",
                                    as: "service"
                                },
                            },
                            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
                        ],
                    }
                },

                {
                    $lookup:
                        {
                            from: 'orderaccepteds',
                            localField: '_id',
                            foreignField: 'order',
                            "pipeline": [
                                {
                                    $match: {user: {'$in' : contractorsListArr}}
                                },
                                {"$project": {"user": 1, "statusBit": 1}}
                            ],
                            as: 'orderaccepteds',
                        },
                },
                {
                    $unwind: '$orderaccepteds'
                },

            ]);


            let completedProjects  = await OrderModel.aggregate([
                {
                    $match: {orderStatus:'Completed'}
                },
                {
                $lookup: {
                    from: "orderdetails",
                    localField: "_id",
                    foreignField: "order",
                    as: "orderdetails",
                    pipeline: [
                        {
                            $lookup: {
                                from: "properties",
                                localField: "property",
                                foreignField: "_id",
                                as: "property"
                            },
                        },
                        { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "services",
                                localField: "service",
                                foreignField: "_id",
                                as: "service"
                            },
                        },
                        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },

                    ],
                }
               },
                {
                    $lookup:
                        {
                            from: 'orderaccepteds',
                            localField: '_id',
                            foreignField: 'order',
                            "pipeline": [
                                {
                                    $match: {user: {'$in' : contractorsListArr}}
                                },
                                {"$project": {"user": 1, "statusBit": 1}}
                            ],
                            as: 'orderaccepteds',
                        },
                },
                {
                    $unwind: '$orderaccepteds'
                },

                ]);


            let finalArray = {
                "findCompany" : findCompany,
                "activeProjects" : activeProjects,
                "completedProjects" : completedProjects
            }

            if(!finalArray){
                let result = makeApiResponce('Empty list coupon', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Coupon Listing', 1, OK, finalArray);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

};