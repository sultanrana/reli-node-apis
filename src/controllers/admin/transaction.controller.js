import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import customerService from "../../services/customer.service.js";
import UserModel from "../../models/user.model";
import { makeApiResponce } from '../../libraries/responce';
import OrderModel from "../../models/order.model";
import PropertyModel from "../../models/property.model";
import OrderDetailModel from "../../models/orderDetail.model";
import transactionService from "../../services/transaction.service";
// Setup Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default {

/////////// project /////////////////
    async listing(req, res) {
        try {
            const getCompletedOrders = await OrderModel.aggregate(
                [
                    // {
                    //     $match: {orderAccepted: { $ne: null }, orderStatus:'Completed',requestStatus:'Accepted'}
                    // },
                    // {
                    //     $lookup:
                    //         {
                    //             from: 'orderdetails',
                    //             localField: '_id',
                    //             foreignField: 'order',
                    //             as: 'orderdetails'
                    //         }
                    // },
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
                    {
                        $unwind: '$orderaccepteds'
                    },
                    {
                        $sort: { createdAt: -1 }
                    }

                ]
            );

            if(!getCompletedOrders){
                let result = makeApiResponce('Empty list of Transactions', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let result = makeApiResponce('List of Transactions', 1, OK, getCompletedOrders);
            return res.json(result);


        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async refundTransaction(req, res) {


       // VALIDATE THE REQUEST


        const {error, value} = transactionService.validateRefundTransactionSchema(req.body);
        if(error && error.details){
            let result = makeApiResponce(error.message, 0, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        const findOrder = await OrderModel.findOne({_id:req.body.orderId});
        if (!findOrder) {
            let result = makeApiResponce('Transaction not found.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }else if(findOrder.stripeRefundId){
            let result = makeApiResponce('Transaction already found in refunded state.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }

        try {
            let stripePaymentId = findOrder.stripePaymentId;

            let refundTransaction = await stripe.refunds.create({
                charge: stripePaymentId,
                amount: req.body.refundAmount * 100
            });

            findOrder.stripeRefundId = refundTransaction.id;
            findOrder.stripeBalanceTransactionId = refundTransaction.balance_transaction;
            findOrder.refundAmount = req.body.refundAmount;
            findOrder.refundDate = Date.now();
            await findOrder.save();


            let result = makeApiResponce('Refund successful', 1, OK, findOrder);
            return res.json(result);

        }catch(err){
            let errorMessage
            console.log(err)
            switch (err.type) {
                case 'StripeCardError':
                    // A declined card error
                    err.message; // => e.g. "Your card's expiration year is invalid."
                    errorMessage = "Your card's expiration year is invalid, "+err.message;
                    break;
                case 'StripeInvalidRequestError':
                    // Invalid parameters were supplied to Stripe's API
                    errorMessage = "Invalid parameters were supplied to Stripe's API, "+err.message;
                    break;
                case 'StripeAPIError':
                    // An error occurred internally with Stripe's API
                    errorMessage = "An error occurred internally with Stripe's API, "+err.message;
                    break;
                case 'StripeConnectionError':
                    // Some kind of error occurred during the HTTPS communication
                    errorMessage = "Some kind of error occurred during the HTTPS communication, "+err.message;
                    break;
                case 'StripeAuthenticationError':
                    // You probably used an incorrect API key
                    errorMessage = "You probably used an incorrect API key, "+err.message;
                    break;
                case 'StripeRateLimitError':
                    // Too many requests hit the API too quickly
                    errorMessage = "Too many requests hit the API too quickly, "+err.message;
                    break;
                case 'StripePermissionError':
                    // Access to a resource is not allowed
                    errorMessage = "Access to a resource is not allowed, "+err.message;
                    break;
                case 'StripeIdempotencyError':
                    // An idempotency key was used improperly
                    errorMessage = "An idempotency key was used improperly, "+err.message;
                    break;
                case 'StripeInvalidGrantError':
                    // InvalidGrantError is raised when a specified code doesn't exist, is
                    // expired, has been used, or doesn't belong to you; a refresh token doesn't
                    // exist, or doesn't belong to you; or if an API key's mode (live or test)
                    // doesn't match the mode of a code or refresh token.
                    errorMessage = " // InvalidGrantError is raised when a specified code doesn't exist, is\n" +
                        "                    // expired, has been used, or doesn't belong to you; a refresh token doesn't\n" +
                        "                    // exist, or doesn't belong to you; or if an API key's mode (live or test)\n" +
                        "                    // doesn't match the mode of a code or refresh token, "+err.message;
                    break;
                default:
                    let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                    return res.status(INTERNAL_SERVER_ERROR).json(result)
            }

            let result1 = makeApiResponce(errorMessage, 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result1);
        }

    }
};