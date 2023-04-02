import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import customerService from "../../services/customer.service.js";
import UserModel from "../../models/user.model";
import { makeApiResponce } from '../../libraries/responce';
import OrderModel from "../../models/order.model";
import PropertyModel from "../../models/property.model";

export default {

/////////// customer /////////////////

    async listing(req, res) {
        try {
        // await  UserModel.find({delBit: false, $or:[ {userType: 'contractor'}, {userType: 'customer'} ]}, function(err, customers) {
            await  UserModel.find({delBit: false, userType: "customer"},async function(err, customers) {
                if (err) {
                    let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                    return res.status(INTERNAL_SERVER_ERROR).json(result)
                } else {

                    let customerRecord = [];
                    await Promise.all(customers.map(async (doc) => {
                        let numberOfProperties =  await PropertyModel.countDocuments({user : doc._id},(count)=>count);
                        let numberOfOpenProjects =  await OrderModel.countDocuments({user : doc._id,orderStatus: { "$ne": 'Completed' }},(count)=>count);
                        let numberOfCompletedProjects =  await OrderModel.countDocuments({user : doc._id,orderStatus:'Completed'},(count)=>count);
                        const totalPurchases = await OrderModel.aggregate([
                            {
                                $match : {user: doc._id, delBit: false}
                                },
                            {
                                $group: { _id: null , totalAmount : { $sum : '$totalAmount'}}
                            }
                        ])
                        // console.log(totalPurchases);
                        // return false;
                        let totalCustomerPurchases = 0;

                        if (totalPurchases.length > 0) {
                            totalCustomerPurchases = totalPurchases[0].totalAmount;
                        }
                        customerRecord.push({
                            id: doc._id,
                            firstName: doc.firstName,
                            lastName: doc.lastName,
                            email: doc.email,
                            phoneNumber: doc.phoneNumber,
                            numberOfProperties:numberOfProperties,
                            numberOfOpenProjects:numberOfOpenProjects,
                            numberOfCompletedProjects:numberOfCompletedProjects,
                            totalPurchases:totalCustomerPurchases,
                            userType: doc.userType,
                            statusBit: doc.statusBit,
                            lastLoginAt:doc.lastLoginAt
                        });

                        console.log(customerRecord)
                    }));
                    let customerRecordResponce = customerRecord;
                    let result = makeApiResponce('Customer Listing', 1, OK, customerRecordResponce);
                    return res.json(result);
                }
            })

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async detail(req, res) {
        try {
            const findCustomer = await UserModel.findOne({_id:req.params.id, delBit: false, userType: "customer"});
            let getProperties =  await PropertyModel.find({user : findCustomer._id});
           // let getOrders =  await OrderModel.find({user : findCustomer._id});

            const getOrders = await OrderModel.aggregate(
                [
                    {
                        $match: {user : findCustomer._id}
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
                    {
                        $lookup:
                            {
                                from: 'orderaccepteds',
                                localField: '_id',
                                foreignField: 'order',
                                "pipeline": [
                                    // {
                                    //     $match: {user: currentUserId}
                                    // },
                                    {"$project": {"user": 1, "statusBit": 1}}
                                ],
                                as: 'orderaccepteds',
                            },
                    },
                    // {
                    //     $unwind: '$orderaccepteds'
                    // },
                    {
                        $sort: { createdAt: -1 }
                    }

                ]
            );




            if (!findCustomer) {
                let result = makeApiResponce('Customer not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const url = req.protocol + '://' + req.get('host')
            let customerResponce = {
                id: findCustomer._id,
                firstName: findCustomer.firstName,
                lastName: findCustomer.lastName,
                email: findCustomer.email,
                phoneNumber: findCustomer.phoneNumber,
                userType: findCustomer.userType,
                statusBit: findCustomer.statusBit,
                profileImage :url + "/src/uploads/images/userImage/"+findCustomer.profileImage,
                properties:getProperties,
                orders:getOrders

            }
            let result = makeApiResponce('Customer Detail', 1, OK, customerResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    
    async update(req, res) {
        try {
            const findCustomer = await UserModel.findOne({_id:req.params.id, delBit: false, userType: "customer"});
            if (!findCustomer) {
                let result = makeApiResponce('Customer not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let image='';
            if (req.files[0]!== undefined) {
                image = req.files[0].filename;
            }

            // VALIDATE THE REQUEST
            const {error, value} = customerService.validateUpdateCustomerSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            findCustomer.firstName = req.body.firstName;
            findCustomer.statusBit = req.body.statusBit;
            if (req.files[0]!== undefined) {
                findCustomer.profileImage = image;
            }
            await findCustomer.save();

            let customerResponce = {
                id: findCustomer._id
            }

            let result = makeApiResponce('Customer updated successfully', 1, OK, customerResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async status(req, res) {
        try {

            const findCustomer = await UserModel.findOne({_id:req.params.id, delBit: false, userType: "customer"});
            if (!findCustomer) {
                let result = makeApiResponce('Customer not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // VALIDATE THE REQUEST
            const {error, value} = customerService.validateUpdateCustomerStatusSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            findCustomer.statusBit = req.body.statusBit;
            await findCustomer.save();

            let customerResponce = {
                id: findCustomer._id
            }

            let result = makeApiResponce('Customer status updated successfully', 1, OK, customerResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async delete(req, res) {
        try {
            const findCustomer = await UserModel.findById(req.params.id);
            if (!findCustomer) {
                let result = makeApiResponce('Customer not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const deleteCustomer = await UserModel.deleteOne({ _id: req.params.id });
            if (!deleteCustomer) {

                let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }


            let getProperties =  await PropertyModel.find({user : findCustomer._id});
            let getOrders =  await OrderModel.find({user : findCustomer._id});

            await getProperties.map( async (property)=>{
                await PropertyModel.findByIdAndRemove(property._id);
            })

            await getOrders.map( async (order)=>{
                await OrderModel.findByIdAndRemove(order._id);
            })

            let customerResponce = {};
            let result = makeApiResponce('Customer Delete Successfully', 1, OK, customerResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

};