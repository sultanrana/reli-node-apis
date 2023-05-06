import {BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK, NOT_FOUND} from "http-status-codes";
import bcryptjs from 'bcryptjs';
import userService from "../../services/user.service.js";
import UserModel from "../../models/user.model";
import { getJWTToken, randomValueHex, getEncryptedPassword } from '../../libraries/util';
import { makeApiResponce } from '../../libraries/responce';
import { sendEmail } from "../../libraries/mail";
import ServiceModel from "../../models/service.model";
import PropertyModel from "../../models/property.model";
import OrderModel from "../../models/order.model";
import OrderDetailModel from "../../models/orderDetail.model";
import CompanyModel from "../../models/company.model";
import OrderAcceptedModel from "../../models/orderAccepted.model";
import StaffModel from "../../models/staff.model";
import mongoose from 'mongoose';
import NotificationModel from "../../models/notification.model";
import AssignedOrderModel from "../../models/assignedOrder.model";
import UserStripeCardModel from "../../models/userStripeCard.model";
import ActivityLogModel from "../../models/activityLog.model";

import fcmNode from "fcm-node";
const FCM = require('../../libraries/notifications.js');

// Setup Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
export default {
    
    async signup(req, res) {
        try {
            
            // const randomOtp = await randomValueHex("6");
        
            // VALIDATE THE REQUEST
            // const {error, value} = userService.validateSignupSchema(req.body);
            // if(error && error.details){
            //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
            //     return res.status(BAD_REQUEST).json(result);
            // }

            const existingUser = await UserModel.findOne({ email: req.body.email });
            if (existingUser) {
                let result = makeApiResponce('Email is Already Exsit', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const user = new UserModel();

            user.email = req.body.email;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.userType = req.body.userType;
            user.address = req.body.address;
            user.appartment = req.body.appartment;
            user.willingRange = req.body.willingRange;
            user.services = req.body.services;
            user.company = req.body.company;
            user.accountType = req.body.accountType;
            // user.otp = randomOtp;
            user.location = { type: 'Point', coordinates: [req.body.lat, req.body.lng] };
            const hash = await getEncryptedPassword(req.body.password);
            user.password = hash;
            await user.save();
            let userResponce = {
                email: user.email,
            }
           if (req.body.userType=='customer') {
               const customer = await stripe.customers.create({
                   name: req.body.firstName + ' ' + req.body.lastName,
                   email: req.body.email,
                   description: 'My First Test Customer (created for API docs at https://www.stripe.com/docs/api)',
                   address: {
                       city: 'customer city',
                       country: 'customer country',
                       line1: req.body.address,
                       line2: 'customer address line 2',
                       postal_code: 'customer postcode'
                   }

               });

               user.stripeCustomerId = customer.id;
               await user.save();


               const passwordLinkNewUser = `
                <p>${req.body.firstName},</p><p>Welcome to Reli, the easiest system for home repairs!</p><p>Reli is a company dedicated to making home repairs simple.</p>`;
                // node mailer
                    const mailResponceNewUser = await sendEmail({
                        html: passwordLinkNewUser,
                        subject: `Welcome to the Reli System`,
                        email: req.body.email,
                    });
           }



            // const passwordLink = `
            //     <h2>Hi ${req.body.firstName}</h2>
            //     <p>Verification code is: <span style="font-weight:bold">${randomOtp}</span> </a></p>`;
            // // node mailer
            //     const mailResponce = await sendEmail({
            //         html: passwordLink,
            //         subject: "Verification Code",
            //         email: req.body.email,
            //     });
                        
            let result = makeApiResponce('User Created Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async login(req, res){
            try{
                // VALIDATE THE REQUEST
                // const {error, value} = userService.validateLoginSchema(req.body);
                // if(error && error.details){
                //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                //     return res.status(BAD_REQUEST).json(result);
                // }
                // FETCH THE USER
                const userQuery = { email: req.body.email };
                let user =  await UserModel.findOne(userQuery);
                if(!user){
                    let result = makeApiResponce('Please check your email and password, then try again', 1, BAD_REQUEST)
                    return res.status(BAD_REQUEST).json(result);
                }
                const matched = await bcryptjs.compare(req.body.password, user.password)
                if(!matched){
                    let result = makeApiResponce('invalid Credential', 1, BAD_REQUEST)
                    return res.status(BAD_REQUEST).json(result);
                }
                
                if (user.statusBit == false) {
                    let result = makeApiResponce('User not verified.', 1, BAD_REQUEST)
                    return res.status(BAD_REQUEST).json(result);
                } else {
                    const token = await getJWTToken({ id: user._id });
                    let userResponce;
                        userResponce = {
                            userData : user,
                            token: token
                        }

                    const findUser = await UserModel.findById(user._id);
                    findUser.fcmToken = req.body.fcmToken;
                    await findUser.save();

                    let result = makeApiResponce('LoggedIn Successfully', 1, OK, userResponce);
                    return res.json(result);       
                }


            }catch(err){
                console.log(err);
                let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                return res.status(INTERNAL_SERVER_ERROR).json(result)
            }
    },

    async logout(req, res){
        req.logout();
        req.session.destroy();
        return res.json({ success: true });
    },

    async getLoginUserProfile(req, res){
        return res.json(req.currentUser);
    },

    async changePassword(req, res) {
        try {            
            // VALIDATE THE REQUEST
            const {error, value} = userService.validateChangePasswordSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('This email address does not have an account.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER
            const hash = await getEncryptedPassword(req.body.newPassword);
            findUser.password = hash;
            await findUser.save();

            let userResponce = {
                userData: findUser
            }
            let result = makeApiResponce('User Update Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async updatePhoneNumber(req, res) {
        try {            
            // VALIDATE THE REQUEST
            const {error, value} = userService.validatePhoneNumberSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('This email address does not have an account.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER
            findUser.phoneNumber = req.body.phoneNumber;
            await findUser.save();

            let userResponce = {
                userData: findUser
            }
            let result = makeApiResponce('Phone Number Update Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async updateAccountDetail(req, res) {
        try {
            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('This email address does not have an account.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER
            findUser.firstName = req.body.firstName;
            findUser.lastName = req.body.lastName;
            await findUser.save();

            let userResponce = {
                userData: findUser
            }
            let result = makeApiResponce('Account Detail Update Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async updateLocation(req, res) {
        try {
            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('This email address does not have an account.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER            
            findUser.address = req.body.address
            findUser.appartment = req.body.appartment
            findUser.willingRange = req.body.willingRange
            findUser.zipCode = req.body.zipCode
            findUser.state = req.body.state
            findUser.city = req.body.city
            findUser.location = { type: 'Point', coordinates: [req.body.lat, req.body.lng] };
            await findUser.save();

            let userResponce = {
                userData: findUser
            }
            let result = makeApiResponce('Account Detail Update Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async verifyOTP(req, res){
        try{
            // FETCH THE USER
            const userQuery = { email: req.body.email, otp: req.body.otp };
            let user =  await UserModel.findOne(userQuery);
            if(!user){
                let result = makeApiResponce('Code is invalid', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            user.statusBit = true;
            await user.save();
            
            const token = await getJWTToken({ id: user._id });
            let userResponce;
                userResponce = {
                    userData : user,
                    token: token
                }
            let result = makeApiResponce('Verify OTP Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async resendVerifyOTP(req, res) {
        try {

            const randomResendOTP = await randomValueHex("6");
            const findUser = await UserModel.findOne({email: req.body.email });
            if (!findUser) {
                let result = makeApiResponce('This email address does not have an account.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const checkUserStatus = await UserModel.findOne({ email : req.body.email, statusBit: false });
            if (!checkUserStatus) {
                let result = makeApiResponce('This user is already verified.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER            
            findUser.otp = randomResendOTP;
            await findUser.save();

            const passwordLink = `
                <p>Verification code is: <span style="font-weight:bold">${randomResendOTP}</span> </a></p>`;
            // node mailer
                const mailResponce = await sendEmail({
                    html: passwordLink,
                    subject: "Verification Code",
                    email: req.body.email,
                });

            let userResponce = {};
            let result = makeApiResponce('Send OTP Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async forgotPassword(req, res) {
        try {            
            const randomForgotOTP = await randomValueHex("6");
            const findUser = await UserModel.findOne({ email: req.body.email });
            if (!findUser) {
                let result = makeApiResponce('This email address does not have an account.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER
            const hash = await getEncryptedPassword(randomForgotOTP);
            findUser.password = hash;
            findUser.otp = randomForgotOTP;
            await findUser.save();

            const passwordLink = `
            <p>${findUser.firstName},</p><p>A request has been received to change the password for your Reli account.</p><p>Here is your verification code to reset your password: <span style="font-weight:bold">${randomForgotOTP}</span> </p>`;
            // node mailer
                const mailResponce = await sendEmail({
                    html: passwordLink,
                    subject: `${findUser.firstName}, your requested password update`,
                    email: req.body.email,
                });
            
            let userResponce = {};
            let result = makeApiResponce('Password Update Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async contactUs(req, res) {
        try {            
            const passwordLink = `
            <p>Message :  ${req.body.message}</p>`;
            // node mailer
                const mailResponce = await sendEmail({
                    html: passwordLink,
                    subject: req.body.subject,
                    email: "farhatbaig77@gmail.com",
                });
            
            let userResponce = {};
            let result = makeApiResponce('Email Send Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async deleteAccount(req, res) {
        try {
            
            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('This email address does not have an account.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const deleteUser = await UserModel.deleteOne({ _id: req.params.id });
            if (!deleteUser) {
                let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            
            let userResponce = {};
            let result = makeApiResponce('Acount Delete Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async getAllServices(req, res){
        try{        
            let getServices =  await ServiceModel.find({});
            if(!getServices){
                let result = makeApiResponce('not found', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
                let result = makeApiResponce('Successfully', 1, OK, getServices);
                return res.json(result);       
        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async createCart(req, res){
        try{        
            let getServices =  await ServiceModel.find({});
            if(!getServices){
                let result = makeApiResponce('not found', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
                let result = makeApiResponce('Successfully', 1, OK, getServices);
                return res.json(result);       
        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    
         
    async listing(req, res){
        try{
            let getProperty =  await PropertyModel.find({user : req.currentUser});
            if(!getProperty){
                let result = makeApiResponce('Empty list Property', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Property Listing', 1, OK, getProperty);
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
            
            const propertyModel = new PropertyModel();
            propertyModel.user = req.currentUser;
            propertyModel.name = req.body.name;
            propertyModel.addressOne = req.body.addressOne;
            propertyModel.addressTwo = req.body.addressTwo;
            propertyModel.city = req.body.city;
            propertyModel.state = req.body.state;
            propertyModel.zipCode = req.body.zipCode;
            propertyModel.floors = req.body.floors;
            propertyModel.basement = req.body.basement;
            propertyModel.image = image;
            propertyModel.save();
            let propertyResponce = {
                id: propertyModel._id 
            }
            let result = makeApiResponce('property Created Successfully', 1, OK, propertyResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async update(req, res) {
        try {

            const propertyModel = await PropertyModel.findById(req.params.id);
            if (!propertyModel) {
                let result = makeApiResponce('Coupon not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let image='';
            if (req.files[0]!== undefined) {
                image = req.files[0].filename;
            }
             
            propertyModel.user = req.currentUser;
            propertyModel.name = req.body.name;
            propertyModel.addressOne = req.body.addressOne;
            propertyModel.addressTwo = req.body.addressTwo;
            propertyModel.city = req.body.city;
            propertyModel.state = req.body.state;
            propertyModel.zipCode = req.body.zipCode;
            propertyModel.floors = req.body.floors;
            propertyModel.basement = req.body.basement;

            if (req.files[0]!== undefined) {
                propertyModel.image = image;
            }
            propertyModel.save();
            let responce = {
                id: propertyModel._id
            }
            
            let result = makeApiResponce('Successfully', 1, OK, responce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async detail(req, res){
        try{
            const propertyModel = await PropertyModel.findById(req.params.id);
            if(!propertyModel){
                let result = makeApiResponce('Empty list Property', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Property Detail', 1, OK, propertyModel);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async delete(req, res) {
        try {
            const findPropert = await PropertyModel.findById(req.params.id);
            if (!findPropert) {
                let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const deleteProperty = await PropertyModel.deleteOne({ _id: req.params.id });
            if (!deleteProperty) {
                let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let userResponce = {};
            let result = makeApiResponce('Delete Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async checkEmail(req, res) {
        try {
            const existingUser = await UserModel.findOne({ email: req.body.email });
            if (existingUser) {
                let result = makeApiResponce('Email is Already Exsit', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            } else {
                let result = makeApiResponce('Successfully', 1, OK, []);
                return res.json(result);    
            }
        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

 //    async placeOrder(req, res) {
 //        let data = req.body.arrayData;
 //     //let files = req.files;

 //    let stripeCardToken = req.body.stripeCardToken;

 //    //  const token = await stripe.tokens.create({
 //    //      card: {
 //    //          number: '4242424242424242',
 //    //          exp_month: 2,
 //    //          exp_year: 2023,
 //    //          cvc: '314',
 //    //      }
 //    //  });
 //    //  console.log(token);
 //    //  return ;



 //     try {

 //         const getCardDetailByStripeCardtoken = await stripe.tokens.retrieve(
 //             stripeCardToken
 //         );
 //         const stripeCharge = await stripe.charges.create({
 //             amount: req.body.totalAmount,
 //             currency: 'usd',
 //             source: getCardDetailByStripeCardtoken.id,
 //             description: 'My First Test Charge'
 //         });

 //     var newOrderModel = new OrderModel();
 //     newOrderModel.user = req.currentUser;
 //     newOrderModel.name = req.body.name;
 //     newOrderModel.email = req.body.email;
 //     newOrderModel.cardHolderName = req.body.cardHolderName;
 //     // newOrderModel.country = '';
 //     // newOrderModel.city ='';
 //     // newOrderModel.postcode ='';
 //     // newOrderModel.addressLine1 ='';
 //     // newOrderModel.addressLine2 ='';
 //     newOrderModel.cardBrand =stripeCharge.source.cardBrand;
 //     newOrderModel.cardlast4 =stripeCharge.source.last4;
 //     newOrderModel.cardExpMonth =stripeCharge.source.exp_month;
 //     newOrderModel.cardExpYear =stripeCharge.source.exp_year;
 //     newOrderModel.cardCvc =stripeCharge.source.cvc;
 //     //newOrderModel.stripeCustomerId ='';
 //     newOrderModel.stripePaymentId=stripeCharge.id,
 //     newOrderModel.subTotalAmount = req.body.subTotalAmount;
 //     newOrderModel.discountAmount = req.body.discountAmount;
 //     newOrderModel.totalAmount = req.body.totalAmount;
 //     newOrderModel.save(function (err) {});





 //     for(var i = 0; i < data.length; i++) {

 //         let arr = await getFileNameArrByItem(req.files,i);
 //         //console.log(arr)

 //          var newOrderDetailModel = new OrderDetailModel();
 //         newOrderDetailModel.order = newOrderModel._id;
 //         newOrderDetailModel.serviceId = data[i].serviceId;
 //         newOrderDetailModel.serviceName = data[i].serviceName;
 //         newOrderDetailModel.serviceType = data[i].serviceType;
 //         newOrderDetailModel.propertyId = data[i].propertyId;
 //         newOrderDetailModel.roomType = data[i].roomType;
 //         newOrderDetailModel.distanceFromGround = data[i].distanceFromGround;
 //         newOrderDetailModel.floorType = data[i].floorType;
 //         newOrderDetailModel.measureType = data[i].measureType;
 //         newOrderDetailModel.width = data[i].width;
 //         newOrderDetailModel.height = data[i].height;
 //         newOrderDetailModel.currectMeasurement = data[i].currectMeasurement;
 //         newOrderDetailModel.images = arr;
 //         newOrderDetailModel.temperedGlassType = data[i].temperedGlassType;
 //         newOrderDetailModel.glassType = data[i].glassType;
 //         newOrderDetailModel.designType = data[i].designType;
 //         newOrderDetailModel.colorSelection = data[i].colorSelection;
 //         newOrderDetailModel.styleSelection = data[i].styleSelection;
 //         newOrderDetailModel.openingType = data[i].openingType;
 //         newOrderDetailModel.openingDirection = data[i].openingDirection;
 //         newOrderDetailModel.dateSelection = data[i].dateSelection;
 //         newOrderDetailModel.totalAmount = data[i].totalAmount;
 //         newOrderDetailModel.save(function (err) {});
 //

 //         let orderResponce = {
 //             id: newOrderModel._id
 //         }
 //         let result = makeApiResponce('Order Created Successfully', 1, OK, orderResponce);
 //         return res.json(result);

 //     }catch(err){
 //          let errorMessage
 //         switch (err.type) {
 //             case 'StripeCardError':
 //                 // A declined card error
 //                 err.message; // => e.g. "Your card's expiration year is invalid."
 //                 errorMessage = "Your card's expiration year is invalid, "+err.message;
 //                 break;
 //             case 'StripeInvalidRequestError':
 //                 // Invalid parameters were supplied to Stripe's API
 //                 errorMessage = "Invalid parameters were supplied to Stripe's API, "+err.message;
 //                 break;
 //             case 'StripeAPIError':
 //                 // An error occurred internally with Stripe's API
 //                 errorMessage = "An error occurred internally with Stripe's API, "+err.message;
 //                 break;
 //             case 'StripeConnectionError':
 //                 // Some kind of error occurred during the HTTPS communication
 //                 errorMessage = "Some kind of error occurred during the HTTPS communication, "+err.message;
 //                 break;
 //             case 'StripeAuthenticationError':
 //                 // You probably used an incorrect API key
 //                 errorMessage = "You probably used an incorrect API key, "+err.message;
 //                 break;
 //             case 'StripeRateLimitError':
 //                 // Too many requests hit the API too quickly
 //                 errorMessage = "Too many requests hit the API too quickly, "+err.message;
 //                 break;
 //             case 'StripePermissionError':
 //                 // Access to a resource is not allowed
 //                 errorMessage = "Access to a resource is not allowed, "+err.message;
 //                 break;
 //             case 'StripeIdempotencyError':
 //                 // An idempotency key was used improperly
 //                 errorMessage = "An idempotency key was used improperly, "+err.message;
 //                 break;
 //             case 'StripeInvalidGrantError':
 //                 // InvalidGrantError is raised when a specified code doesn't exist, is
 //                 // expired, has been used, or doesn't belong to you; a refresh token doesn't
 //                 // exist, or doesn't belong to you; or if an API key's mode (live or test)
 //                 // doesn't match the mode of a code or refresh token.
 //                 errorMessage = " // InvalidGrantError is raised when a specified code doesn't exist, is\n" +
 //                     "                    // expired, has been used, or doesn't belong to you; a refresh token doesn't\n" +
 //                     "                    // exist, or doesn't belong to you; or if an API key's mode (live or test)\n" +
 //                     "                    // doesn't match the mode of a code or refresh token, "+err.message;
 //                 break;
 //             default:
 //                 let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
 //                 return res.status(INTERNAL_SERVER_ERROR).json(result)
 //         }

 //          let result1 = makeApiResponce(errorMessage, 1, BAD_REQUEST)
 //         return res.status(BAD_REQUEST).json(result1);


 //     }
 // },

 async placeOrder(req, res) {
        let data = req.body.arrayData;
     //let files = req.files;

     let stripeCardId = req.body.stripeCardId;
    //let stripeCardToken = req.body.stripeCardToken;

     // const token = await stripe.tokens.create({
     //     card: {
     //         number: '4242424242424242',
     //         exp_month: 2,
     //         exp_year: 2023,
     //         cvc: '314',
     //     }
     // });
     // console.log(token);
    // return ;



     try {

         // const getCardDetailByStripeCardtoken = await stripe.tokens.retrieve(
         //     stripeCardToken
         // );
         const stripeCharge = await stripe.charges.create({
             customer:req.currentUser.stripeCustomerId,
             amount: req.body.totalAmount * 100,
             currency: 'usd',
             source: stripeCardId,
             description: 'My First Test Charge'
         });



     var newOrderModel = new OrderModel();
     newOrderModel.user = req.currentUser;
     newOrderModel.name = req.body.name;
     newOrderModel.email = req.body.email;
     newOrderModel.cardHolderName = req.body.cardHolderName;

     // newOrderModel.country = '';
     // newOrderModel.city ='';
     // newOrderModel.postcode ='';
     // newOrderModel.addressLine1 ='';
     // newOrderModel.addressLine2 ='';

     newOrderModel.cardBrand =stripeCharge.source.cardBrand;
     newOrderModel.cardlast4 =stripeCharge.source.last4;
     newOrderModel.cardExpMonth =stripeCharge.source.exp_month;
     newOrderModel.cardExpYear =stripeCharge.source.exp_year;
     newOrderModel.cardCvc =stripeCharge.source.cvc;

     //newOrderModel.stripeCustomerId ='';

    newOrderModel.stripePaymentId=stripeCharge.id,

     newOrderModel.subTotalAmount = req.body.subTotalAmount;
     newOrderModel.discountAmount = req.body.discountAmount;
     newOrderModel.totalAmount = req.body.totalAmount;
     let dateArr = req.body.dateSelection.split(",");
     newOrderModel.dateSelection = dateArr;
     newOrderModel.save(function (err) {});





     for(var i = 0; i < data.length; i++) {

         let arr = await getFileNameArrByItem(req.files,i);
         //console.log(arr)

          var newOrderDetailModel = new OrderDetailModel();
         newOrderDetailModel.order = newOrderModel._id;
         newOrderDetailModel.service = data[i].serviceId;
         newOrderDetailModel.serviceName = data[i].serviceName;
         newOrderDetailModel.serviceType = data[i].serviceType;
         newOrderDetailModel.property = data[i].propertyId;
         newOrderDetailModel.roomType = data[i].roomType;
         newOrderDetailModel.distanceFromGround = data[i].distanceFromGround;
         newOrderDetailModel.floorType = data[i].floorType;
         newOrderDetailModel.measureType = data[i].measureType;
         newOrderDetailModel.width = data[i].width;
         newOrderDetailModel.height = data[i].height;
         newOrderDetailModel.currectMeasurement = data[i].currectMeasurement;
         newOrderDetailModel.images = arr;
         newOrderDetailModel.temperedGlassType = data[i].temperedGlassType;
         newOrderDetailModel.glassType = data[i].glassType;
         newOrderDetailModel.designType = data[i].designType;
         newOrderDetailModel.colorSelection = data[i].colorSelection;
         newOrderDetailModel.styleSelection = data[i].styleSelection;
         newOrderDetailModel.openingType = data[i].openingType;
         newOrderDetailModel.openingDirection = data[i].openingDirection;
         newOrderDetailModel.totalAmount = data[i].totalAmount;
         newOrderDetailModel.save(function (err) {});
     }

         let orderResponce = {
             id: newOrderModel._id
         }


        const activityLogModelData = new ActivityLogModel();
        activityLogModelData.title = 'Project Created';
        activityLogModelData.message = 'Your project has been created';
        activityLogModelData.type = 'Project created';
        activityLogModelData.order = newOrderModel._id;
        activityLogModelData.user = req.currentUser._id;
        activityLogModelData.save();


         let result = makeApiResponce('property Created Successfully', 1, OK, orderResponce);
         return res.json(result);

     }catch(err){
          let errorMessage
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
 },


 async dashboard(req, res){
        try{

         // console.log(req.currentUser);

            //let getOrder = await OrderModel.find({user : req.currentUser});
            let getOrder =  await OrderModel.aggregate(
                [
                    {
                        $match: {user : req.currentUser._id}
                    },
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
                    // {
                    //     $lookup:
                    //         {
                    //             from: 'orderaccepteds',
                    //             localField: '_id',
                    //             foreignField: 'order',
                    //             "pipeline": [
                    //                 {
                    //                     $match: {user: currentUserId}
                    //                 },
                    //                 {"$project": {"user": 1, "statusBit": 1}}
                    //             ],
                    //             as: 'orderaccepteds',
                    //         },
                    // },
                    // {
                    //     $unwind: '$orderaccepteds'
                    // },
                    {
                        $sort: { createdAt: -1 }
                    }

                ]
            );

            // let getCompletedOrders = await OrderModel.find({orderStatus:'Completed',requestStatus:'Accepted',dateSelection: { $elemMatch: {$eq: todayDate}}});

            //await OrderModel.find({user : req.currentUser});
            //  console.log(getOrder);
            // console.log(req.currentUser);
            // return ;


            if(!getOrder){
                let result = makeApiResponce('Empty list Order', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Order Listing', 1, OK, getOrder);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async listOfProjects(req, res){
        try{
            let getCompletedStatusOrders  = await OrderModel.aggregate(
                [
                    {
                        $match: {user : req.currentUser._id,orderStatus:'Completed'}
                    },
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
                                // "pipeline": [
                                //     {
                                //         $match: {user: currentUserId}
                                //     },
                                //     {"$project": {"user": 1, "statusBit": 1}}
                                // ],
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


                //await OrderModel.find({user : req.currentUser,orderStatus:'Completed'});
            let getNotCompletedStatusOrders  = await OrderModel.aggregate(
                [
                    {
                        $match: {user : req.currentUser._id,orderStatus: { "$ne": 'Completed' }}
                    },
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
                                // "pipeline": [
                                //     {
                                //         $match: {user: currentUserId}
                                //     },
                                //     {"$project": {"user": 1, "statusBit": 1}}
                                // ],
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



              //  await OrderModel.find({user : req.currentUser,orderStatus: { "$ne": 'Completed' }});

            if(!getCompletedStatusOrders && !getNotCompletedStatusOrders){
                let result = makeApiResponce('Empty list of Projects', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
           let listOfProjects=[{
                            'completedOrders': getCompletedStatusOrders,
                            'notCompletedOrders': getNotCompletedStatusOrders,
                            }]

            let result = makeApiResponce('Listing Projects ', 1, OK, listOfProjects);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    
    async orderDetail(req, res){
        try{
            const orderModel = await OrderModel.findById(req.params.id);
           // const orderDetailInfo =  await OrderDetailModel.find({order : req.params.id}).populate('property').populate('service');




            let orderDetail  = await OrderModel.aggregate([
                    {
                        $match: {_id: mongoose.Types.ObjectId(req.params.id)}
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
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                // "pipeline": [
                                //     {
                                //         $match: {user: currentUserId}
                                //     },
                                //     {"$project": {"user": 1, "statusBit": 1}}
                                // ],
                                as: 'user',
                            },
                    },
                    {
                        $lookup:
                            {
                                from: 'orderaccepteds',
                                localField: '_id',
                                foreignField: 'order',
                                // "pipeline": [
                                //     {
                                //         $match: {user: currentUserId}
                                //     },
                                //     {"$project": {"user": 1, "statusBit": 1}}
                                // ],
                                as: 'orderaccepteds',
                            },
                    },
                    { $unwind: { path: '$orderaccepteds', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup:
                            {
                                from: 'assignedorders',
                                localField: '_id',
                                foreignField: 'order',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "users",
                                            localField: "userBy",
                                            foreignField: "_id",
                                            as: "userBy"
                                        },
                                    },
                                    // { $unwind: "$property" }, mondatroy
                                    { $unwind: { path: '$userBy', preserveNullAndEmptyArrays: true } },
                                    {
                                        $lookup: {
                                            from: "users",
                                            localField: "userTo",
                                            foreignField: "_id",
                                            as: "userTo"
                                        },
                                    },
                                    { $unwind: { path: '$userTo', preserveNullAndEmptyArrays: true } },

                                    // {
                                    //     $unwind: "$property" if mandatory
                                    // }
                                ],
                                as: 'assignedorder',
                            },
                    },
                    { $unwind: { path: '$assignedorder', preserveNullAndEmptyArrays: true } },
                    // {
                    //     $unwind: '$orderaccepteds'
                    // },
                    {
                        $sort: { createdAt: -1 }
                    }

                ]
            );


            // console.log(orderDetail);
            // console.log(req.params.id);
            // return ;



            if(!orderDetail){
                let result = makeApiResponce('Empty Order Detail', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            // let orderDetail=[{
            //     'orderInfo': orderModel,
            //     'orderDetails': orderDetailInfo,
            //     }]
            let result = makeApiResponce('Order Detail', 1, OK, orderDetail);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async addCustomerStripeCard(req, res) {
        let stripeCardToken = req.body.stripeCardToken;
        let stripeCardHolderName = req.body.stripeCardHolderName;

        // const token = await stripe.tokens.create({
        //     card: {
        //         number: '4242424242424242',
        //         exp_month: 4,
        //         exp_year: 2023,
        //         cvc: '314',
        //     }
        // });
        // console.log(token);
        // return ;


        try {

            const stripeCustomerCard = await stripe.customers.createSource(
                req.currentUser.stripeCustomerId,
                {
                        source: stripeCardToken,
                       }



            );

            let newUserStripeCardModel = new UserStripeCardModel();
            newUserStripeCardModel.user = req.currentUser;
            newUserStripeCardModel.stripeCardHolderName = stripeCardHolderName;
            newUserStripeCardModel.stripeCardId = stripeCustomerCard.id;

            newUserStripeCardModel.stripeCardBrand =stripeCustomerCard.brand;
            newUserStripeCardModel.stripeCardlast4 =stripeCustomerCard.last4;
            newUserStripeCardModel.stripeCardExpMonth =stripeCustomerCard.exp_month;
            newUserStripeCardModel.stripeCardExpYear =stripeCustomerCard.exp_year;
          //  newUserStripeCardModel.stripeCardCvc =stripeCustomerCard.cvc;
            newUserStripeCardModel.save(function (err) {});

            let userStripeCardResponce = {
                id: newUserStripeCardModel._id
            }
            let result = makeApiResponce('Customer stripe card created successfully', 1, OK, userStripeCardResponce);
            return res.json(result);

        }catch(err){
            let errorMessage
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
    },
    async listOfCustomerStripeCards(req, res){
        try{
            let getUserStripeCards  = await UserStripeCardModel.aggregate(
                [
                    {
                        $match: {user : req.currentUser._id}
                    },
                    {
                        $sort: { createdAt: -1 }
                    }

                ]
            );

            if(!getUserStripeCards){
                let result = makeApiResponce('Empty list of user stripe cards', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Listing user stripe cards', 1, OK, getUserStripeCards);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async customerStripeCardDetail(req, res){
        try{
            const userStripeCardModel = await UserStripeCardModel.findById(req.params.id);
            // const orderDetailInfo =  await OrderDetailModel.find({order : req.params.id}).populate('property').populate('service');







            if(!userStripeCardModel){
                let result = makeApiResponce('Empty customer stripe card detail', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Customer stripe card detail', 1, OK, userStripeCardModel);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async listOfCompanies(req, res){
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
    async contractorDashboard(req, res){
        try{
            // orders that has requestStatus=Pending
            let getClaimOrders = await OrderModel.aggregate(
                // [
                //     {
                //         $match: {orderStatus:'Pending',requestStatus:'Pending'}
                //     },
                //     // {
                //     //     $lookup:
                //     //         {
                //     //             from: 'orderdetails',
                //     //             localField: '_id',
                //     //             foreignField: 'order',
                //     //             as: 'orderdetails'
                //     //         }
                //     // },
                //     {
                //         $lookup: {
                //             from: "orderdetails",
                //             localField: "_id",
                //             foreignField: "order",
                //             as: "orderdetails",
                //             pipeline: [
                //                 {
                //                     $lookup: {
                //                         from: "properties",
                //                         localField: "property",
                //                         foreignField: "_id",
                //                         as: "property"
                //                     },
                //                 },
                //                 // { $unwind: "$property" }, mondatroy
                //                 { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
                //                 {
                //                     $lookup: {
                //                         from: "services",
                //                         localField: "service",
                //                         foreignField: "_id",
                //                         as: "service"
                //                     },
                //                 },
                //                 { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },

                //                 // {
                //                 //     $unwind: "$property" if mandatory
                //                 // }
                //             ],
                //         }
                //     },
                //     {
                //         $lookup:
                //             {
                //                 from: 'orderaccepteds',
                //                 localField: '_id',
                //                 foreignField: 'order',
                //                 // "pipeline": [
                //                 //     {
                //                 //         $match: {user: currentUserId}
                //                 //     },
                //                 //     {"$project": {"user": 1, "statusBit": 1}}
                //                 // ],
                //                 as: 'orderaccepteds',
                //             },
                //     },
                //     {
                //         $unwind: '$orderaccepteds'
                //     },
                //     {
                //         $sort: { createdAt: -1 }
                //     }

                // ]


                [
                    {
                        $match: {orderStatus:'Pending',requestStatus:'Pending'}
                    },
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
                                // "pipeline": [
                                //     {
                                //         $match: {user: currentUserId}
                                //     },
                                //     {"$project": {"user": 1, "statusBit": 1}}
                                // ],
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

                //await OrderModel.find({orderStatus:'Pending',requestStatus:'Pending'});
            // orders that has requestStatus=Accepted and by logged in contractor
            let getActionNeededOrders = await OrderModel.aggregate(
                [
                    {
                        $match: {requestStatus:'Accepted',orderStatus: { $ne: 'Completed' }}
                    },
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
                                // "pipeline": [
                                //     {
                                //         $match: {user: currentUserId}
                                //     },
                                //     {"$project": {"user": 1, "statusBit": 1}}
                                // ],
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

                //await OrderModel.find({requestStatus:'Accepted',orderStatus: { $ne: 'Completed' }});

            if(!getClaimOrders && !getActionNeededOrders){
                let result = makeApiResponce('Empty list of Projects', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let contractorDashboard=[{
                'claimOrders': getClaimOrders,
                'actionNeededOrders': getActionNeededOrders,
            }]

            let result = makeApiResponce('List of Projects', 1, OK, contractorDashboard);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    
    async listOfActiveContractorProjects(req, res) {
        const currentUserId = req.currentUser._id;
        try{
            const getActiveOrders = await OrderModel.aggregate(
                    [
                        {
                        $match: {orderAccepted: { $ne: null }, requestStatus:'Accepted',orderStatus: { $ne: 'Completed' }}
                        },
                    //     {
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
                                    {
                                        $match: {user: currentUserId}
                                    },
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

            if(!getActiveOrders){
                let result = makeApiResponce('Empty list of Active Projects', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('List of Active Projects', 1, OK, getActiveOrders);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async listOfAvailableContractorProjects(req, res){
        try{
            let getAvailableOrders = await OrderModel.aggregate(
                [
                    {
                        $match: {orderStatus:'Pending',requestStatus:'Pending'}
                    },
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
                                // "pipeline": [
                                //     {
                                //         $match: {user: currentUserId}
                                //     },
                                //     {"$project": {"user": 1, "statusBit": 1}}
                                // ],
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



                ///await OrderModel.find({orderStatus:'Pending',requestStatus:'Pending'});

            if(!getAvailableOrders){
                let result = makeApiResponce('Empty list of Available Projects', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('List of Available Projects', 1, OK, getAvailableOrders);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async listOfCompletedContractorProjects(req, res){
        const currentUserId = req.currentUser._id;
        try{
            const getCompletedOrders = await OrderModel.aggregate(
                [
                    {
                        $match: {orderAccepted: { $ne: null }, orderStatus:'Completed',requestStatus:'Accepted'}
                    },
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
                                    {
                                        $match: {user: currentUserId}
                                    },
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
                let result = makeApiResponce('Empty list of Completed Projects', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            
            let result = makeApiResponce('List of Completed Projects', 1, OK, getCompletedOrders);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async changeProjectRequestStatus(req, res) {
        try {

            const findOrder = await OrderModel.findOne({_id:req.params.id, orderStatus:'Pending', requestStatus:'Pending', delBit: false});
            if (!findOrder) {
                let result = makeApiResponce('Project not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // VALIDATE THE REQUEST
            // const {error, value} = orderService.validateUpdateRequestStatusSchema(req.body);
            // if(error && error.details){
            //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
            //     return res.status(BAD_REQUEST).json(result);
            // }

            const orderAcceptedModel = new OrderAcceptedModel();
            orderAcceptedModel.user = req.currentUser._id;
            orderAcceptedModel.order = findOrder._id;
            orderAcceptedModel.save(function (err) {});
            findOrder.requestStatus = req.body.requestStatus;
            findOrder.orderAccepted = orderAcceptedModel._id;
            await findOrder.save();
            let orderResponce = {
                id: findOrder._id
            }


            const activityLogModelData = new ActivityLogModel();
            activityLogModelData.title = 'Project Accepted';
            activityLogModelData.message = 'Your project has been accepted';
            activityLogModelData.type = 'Change Project Status like accepted';
            activityLogModelData.order = req.params.id;
            activityLogModelData.user = req.currentUser._id;
            activityLogModelData.save();


            let getDataNoti = await OrderModel.findOne({ _id: req.params.id }).populate("user");
            let fcmToken = getDataNoti.user.fcmToken; 
            FCM.push_notification("Project Accepted", `Your project ${req.params.id} has been accepted`, fcmToken, 12);
            // // console.log(fcmToken);
            const notificationModel = new NotificationModel();
            notificationModel.user = mongoose.Types.ObjectId(getDataNoti.user._id);
            notificationModel.title = "Project Accepted";
            notificationModel.body = `Your project ${req.params.id} has been accepted`;
            notificationModel.type = "Project Accepted";
            notificationModel.deviceToken = fcmToken;
            notificationModel.save();


            if(req.body.requestStatus === 'Accepted'){
                const passwordLinkAccp = `
                <p>${getDataNoti.user.firstName},</p><p>Your project ${req.params.id} has been accepted </p>`;
                // node mailer
                    const mailResponceAccp = await sendEmail({
                        html: passwordLinkAccp,
                        subject: `Project Accepted`,
                        email: getDataNoti.user.email,
                    });
            } else if(req.body.requestStatus === 'Rejected'){
                const passwordLinkRej = `
                <p>${getDataNoti.user.firstName},</p><p>Your project ${req.params.id} has been rejected </p>`;
                // node mailer
                    const mailResponceRej = await sendEmail({
                        html: passwordLinkRej,
                        subject: `Project Rejected`,
                        email: getDataNoti.user.email,
                    });
            } else {
                const passwordLinkRev = `
                <p>${getDataNoti.user.firstName},</p><p>Your project ${req.params.id} has been review </p>`;
                // node mailer
                    const mailResponceRev = await sendEmail({
                        html: passwordLinkRev,
                        subject: `Project Review`,
                        email: getDataNoti.user.email,
                    });
            }


            let result = makeApiResponce('Project request status updated successfully', 1, OK, orderResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async changeProjectOrderStatus(req, res) {
        try {
            const findOrder = await OrderModel.findOne({_id:req.params.id, requestStatus:'Accepted', delBit: false});
            if (!findOrder) {
                let result = makeApiResponce('Project not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // VALIDATE THE REQUEST
            // const {error, value} = orderService.validateUpdateOrderStatusSchema(req.body);
            // if(error && error.details){
            //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
            //     return res.status(BAD_REQUEST).json(result);
            // }

            findOrder.orderStatus = req.body.orderStatus;
            // findOrder.orderStatusDate = Date.now();
            findOrder.orderStatusDate = req.body.orderStatusDate;
            await findOrder.save();

            let activityLogTitle = '';
            let activityLogMessage = '';
            let activityLogType = '';

            if (req.body.orderStatus == 'Completed') {
                activityLogTitle = 'Project Completed';
                activityLogMessage = 'Your project has been completed';
                activityLogType = 'Change Project Status like Completed ';
            } else if (req.body.orderStatus == 'Scheduled') {
                activityLogTitle = 'Project Scheduled';
                activityLogMessage = 'your project has been scheduled';
                activityLogType = 'Change Project Status like Scheduled ';
            } else if (req.body.orderStatus == 'Enroute') {
                activityLogTitle = 'Project Enroute';
                activityLogMessage = 'your contractor is on the way';
                activityLogType = 'Change Project Status like Enroute ';
            } else if (req.body.orderStatus == 'Arrived') {
                activityLogTitle = 'Project Arrived';
                activityLogMessage = 'your contractor has arrived';
                activityLogType = 'Change Project Status like Arrived ';
            } else if (req.body.orderStatus == 'Assigned') {
                activityLogTitle = 'Project Assigned';
                activityLogMessage = 'You have been assigned as the contractor for project';
                activityLogType = 'Change Project Status like Assigned ';
            } else if (req.body.orderStatus == 'Unassigned') {
                activityLogTitle = 'Project Unassigned';
                activityLogMessage = 'your contractor has unassigned';
                activityLogType = 'Change Project Status like Unassigned ';
            } else if (req.body.orderStatus == 'Ordered') {
                activityLogTitle = 'Project Ordered';
                activityLogMessage = 'your contractor has ordered';
                activityLogType = 'Change Project Status like Ordered ';    
            } else {
                activityLogTitle = 'Project Status';
                activityLogMessage = '';
                activityLogType = 'Change Project Status like No Chnage ';
            }


            const activityLogModelData = new ActivityLogModel();
            activityLogModelData.title = activityLogTitle;
            activityLogModelData.message = activityLogMessage;
            activityLogModelData.type = activityLogType;
            activityLogModelData.order = req.params.id;
            activityLogModelData.user = req.currentUser._id;
            // console.log(req.currentUser._id);
            // return false;
            activityLogModelData.save();


            let getDataNoti;
            if (req.body.orderStatus == 'Completed') {
                getDataNoti = await OrderModel.findOne({ _id: req.params.id }).populate("user");
                let fcmToken = getDataNoti.user.fcmToken; 
                FCM.push_notification("Project Completed", `Your project ${req.params.id} has been completed`, fcmToken, 12);
                // // console.log(fcmToken);
                const notificationModel = new NotificationModel();
                notificationModel.user = mongoose.Types.ObjectId(getDataNoti.user._id);
                notificationModel.title = "Project Completed";
                notificationModel.body = `Your project ${req.params.id} has been completed`;
                notificationModel.type = "Project Completed";
                notificationModel.deviceToken = fcmToken;
                notificationModel.save();

                const passwordLink = `
                <p>${getDataNoti.user.firstName},</p><p>Your contractor has completed the project ${req.params.id} !</p>`;
            // node mailer
                const mailResponce = await sendEmail({
                    html: passwordLink,
                    subject: `Your project has been completed`,
                    email: getDataNoti.user.email,
                });

                let orderAccepted = getDataNoti.orderAccepted; 
                // console.log(getDataNotiCon);
                let getDataNotiCon = await OrderAcceptedModel.findOne({ _id: orderAccepted }).populate("user");
                let fcmTokenContractor = getDataNotiCon.user.fcmToken; 
                FCM.push_notification("A project has been completed", `The project ${req.params.id} has been completed`, fcmTokenContractor, 12);
                // console.log(getDataNotiCon.user._id);
                const notificationModelContractor = new NotificationModel();
                notificationModelContractor.user = mongoose.Types.ObjectId(getDataNotiCon.user._id);
                notificationModelContractor.title = "A project has been completed";
                notificationModelContractor.body = `The project ${req.params.id} has been completed`;
                notificationModelContractor.type = "Project Completed";
                notificationModelContractor.deviceToken = fcmTokenContractor;
                notificationModelContractor.save();

                const passwordLinkCont = `
                <p>Your project ${req.params.id} has completed!</p>`;
            // node mailer
                const mailResponceCont = await sendEmail({
                    html: passwordLinkCont,
                    subject: `Your project has been completed`,
                    email: getDataNotiCon.user.email,
                });
            }


            
            if (req.body.orderStatus == 'Scheduled') {
                getDataNoti = await OrderModel.findOne({ _id: req.params.id }).populate("user");
                let fcmTokenCusSch = getDataNoti.user.fcmToken;
                let firstNameCusSch = getDataNoti.user.firstName;
                FCM.push_notification("Project Scheduled", `Hi ${firstNameCusSch}, your project ${req.params.id} has been scheduled`, fcmTokenCusSch, 12);
                // // console.log(fcmToken);
                const notificationModel = new NotificationModel();
                notificationModel.user = mongoose.Types.ObjectId(getDataNoti.user._id);
                notificationModel.title = "Project Scheduled";
                notificationModel.body = `Hi ${firstNameCusSch}, your project ${req.params.id} has been scheduled`;
                notificationModel.type = "Project Scheduled";
                notificationModel.deviceToken = fcmTokenCusSch;
                notificationModel.save();



                const passwordLinkSched = `
                <p>${getDataNoti.user.firstName},</p><p>Your project has a new scheduled date for your project ${req.params.id} !</p>`;
            // node mailer
                const mailResponceSched = await sendEmail({
                    html: passwordLinkSched,
                    subject: `Your project has been scheduled`,
                    email: getDataNoti.user.email,
                });

            }


            if (req.body.orderStatus == 'Enroute') {
                getDataNoti = await OrderModel.findOne({ _id: req.params.id }).populate("user");
                let fcmTokenCusEnr = getDataNoti.user.fcmToken;
                let firstNameCusEnr = getDataNoti.user.firstName;
                FCM.push_notification("Contractor on the Way", `Hi ${firstNameCusEnr}, your contractor is on the way`, fcmTokenCusEnr, 12);
                // // console.log(fcmToken);
                const notificationModel = new NotificationModel();
                notificationModel.user = mongoose.Types.ObjectId(getDataNoti.user._id);
                notificationModel.title = "Contractor on the Way";
                notificationModel.body = `Hi ${firstNameCusEnr}, your contractor is on the way`;
                notificationModel.type = "Contractor on the Way";
                notificationModel.deviceToken = fcmTokenCusEnr;
                notificationModel.save();


                const passwordLinkEnr = `
                <p>${getDataNoti.user.firstName},</p><p>Your contractor is on their way for your project ${req.params.id} !</p>`;
            // node mailer
                const mailResponceEnr = await sendEmail({
                    html: passwordLinkEnr,
                    subject: `Your project contractor is on their way`,
                    email: getDataNoti.user.email,
                });

            }


            if (req.body.orderStatus == 'Arrived') {
                getDataNoti = await OrderModel.findOne({ _id: req.params.id }).populate("user");
                let fcmTokenCusArr = getDataNoti.user.fcmToken;
                let firstNameCusArr = getDataNoti.user.firstName;
                FCM.push_notification("Contractor Arrived”", `Hi ${firstNameCusArr}, your contractor has arrived`, fcmTokenCusArr, 12);
                // // console.log(fcmToken);
                const notificationModel = new NotificationModel();
                notificationModel.user = mongoose.Types.ObjectId(getDataNoti.user._id);
                notificationModel.title = "Contractor Arrived”";
                notificationModel.body = `Hi ${firstNameCusArr}, your contractor has arrived`;
                notificationModel.type = "Contractor Arrived”";
                notificationModel.deviceToken = fcmTokenCusArr;
                notificationModel.save();


                const passwordLinkArr = `
                <p>${getDataNoti.user.firstName},</p><p>Your contractor has arrived at the property address for your project ${req.params.id} !</p>`;
            // node mailer
                const mailResponceArr = await sendEmail({
                    html: passwordLinkArr,
                    subject: `Your project contractor has arrived`,
                    email: getDataNoti.user.email,
                });

            }


            if (req.body.orderStatus == 'Assigned') {
                getDataNoti = await AssignedOrderModel.findOne({ order: req.params.id }).populate("userTo");
                // console.log(getDataNoti);
                let fcmTokenContractorAss = getDataNoti.userTo.fcmToken; 
                FCM.push_notification("Project Assignment", `You have been assigned as the contractor for project ${req.params.id}`, fcmTokenContractorAss, 12);
                // console.log(getDataNotiCon.user._id);
                const notificationModelContractor = new NotificationModel();
                notificationModelContractor.user = mongoose.Types.ObjectId(getDataNoti.userTo._id);
                notificationModelContractor.title = "Project Assignment";
                notificationModelContractor.body = `You have been assigned as the contractor for project ${req.params.id}`;
                notificationModelContractor.type = "Project Assignment";
                notificationModelContractor.deviceToken = fcmTokenContractorAss;
                notificationModelContractor.save();

                const passwordLinkAss = `
                <p>${getDataNoti.userTo.firstName},</p><p>You have been assigned to a new Project ${req.params.id} !</p>`;
            // node mailer
                const mailResponceAss = await sendEmail({
                    html: passwordLinkAss,
                    subject: `“New Project Assigned`,
                    email: getDataNoti.userTo.email,
                });

            }

            let orderResponce = {
                id: findOrder._id
            }

            let result = makeApiResponce('Project status updated successfully', 1, OK, orderResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async listOfStaff(req, res) {
        try {
             // const findStaff = await StaffModel.find({company: req.params.id});
             const userQuery = { company: req.params.id, accountType : 'standard_contractor' };
             const findStaff = await UserModel.find(userQuery);
             if (!findStaff) {
                 let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
                 return res.status(BAD_REQUEST).json(result);
             }
             let result = makeApiResponce('List of Staff', 1, OK, findStaff);
             return res.json(result);

         }catch(err){
             console.log(err);
             let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
             return res.status(INTERNAL_SERVER_ERROR).json(result)
         }
     },
    //// NOTIFICAITON CRUD
    async listOfNotifications(req, res){
        try{
            let getNotifications =  await NotificationModel.find().populate('user');
            if(!getNotifications){
                let result = makeApiResponce('Empty list Notifications', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Notification Listing', 1, OK, getNotifications);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async addNotification(req, res) {
        try {
            const notificationModel = new NotificationModel();
            notificationModel.user = mongoose.Types.ObjectId(req.body.user);
            notificationModel.title = req.body.title;
            notificationModel.body = req.body.body;
            notificationModel.type = req.body.type;
            notificationModel.deviceToken = req.body.deviceToken;
            notificationModel.save();
            let notificationResponce = {
                id: notificationModel._id
            }
            let result = makeApiResponce('Notification Created Successfully', 1, OK, notificationResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async notificationDetail(req, res){
        try{
            const notificationModel = await NotificationModel.findById(req.params.id).populate('user');
            if(!notificationModel){
                let result = makeApiResponce('Empty Notification Detail', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Notification Detail', 1, OK, notificationModel);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async assignProjectToUser(req, res) {
        try {
            if (mongoose.isValidObjectId(req.body.userTo) && mongoose.isValidObjectId(req.body.order)) {

                const isProjectAlreadyAssigned = await AssignedOrderModel.findOne({order:req.body.order, delBit: false})
                if (!isProjectAlreadyAssigned) {
                const assignedOrderModel = new AssignedOrderModel();
                assignedOrderModel.order = req.body.order;
                assignedOrderModel.userBy = req.currentUser._id;
                assignedOrderModel.userTo = req.body.userTo;
                assignedOrderModel.assignedDate = req.body.assignedDate;
                assignedOrderModel.save();
                let assignedOrderResponce = {
                    id: assignedOrderModel._id
                }
                let result = makeApiResponce('Assigned project to user created successfully', 1, OK, assignedOrderResponce);
                return res.json(result);
               }else{
                    let result = makeApiResponce('Project is already assigned to user', 0, NOT_FOUND);
                    return res.status(NOT_FOUND).json(result)
                }
           }else{
                let result = makeApiResponce('Invalid UserTo/Order', 0, NOT_FOUND);
                return res.status(NOT_FOUND).json(result)
           }

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async listOfScheduledContractorProjects(req, res){
        const currentUserId = req.currentUser._id;
        try{
            const getScheduledOrders = await OrderModel.aggregate(
                [
                    {
                        $match: {orderAccepted: { $ne: null }, orderStatus:'Scheduled',requestStatus:'Accepted'}
                    },
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
                                    {
                                        $match: {user: currentUserId}
                                    },
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

            if(!getScheduledOrders){
                let result = makeApiResponce('Empty list of Scheduled Projects', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            
            let result = makeApiResponce('List of Scheduled Projects', 1, OK, getScheduledOrders);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },


    async getUserAllStatusBit(req, res){
        try{
            const getAllStatusBit = await UserModel.findById(req.params.id);
            if(!getAllStatusBit){
                let result = makeApiResponce('Empty customer stripe card detail', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('Detail', 1, OK, getAllStatusBit);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async updateUserStatusBit(req, res) {
        try {
            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('This email address does not have an account.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER            
            findUser.newMessageFromCustomerNoti = req.body.newMessageFromCustomerNoti
            findUser.newOrder = req.body.newOrder
            findUser.upcomingDelivery = req.body.upcomingDelivery
            findUser.newMessageFromCustomerEmail = req.body.newMessageFromCustomerEmail
            findUser.projectUpdates = req.body.projectUpdates
            findUser.cancellation = req.body.cancellation
            findUser.rescheduleRequest = req.body.rescheduleRequest
            findUser.reminders = req.body.reminders

            await findUser.save();

            let userResponce = {
                userData: findUser
            }
            let result = makeApiResponce('Update Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },


    async updateStaff(req, res) {
        try {

            const userModel = await UserModel.findById(req.params.id);
            if (!userModel) {
                let result = makeApiResponce('Not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let image='';
            if (req.files[0]!== undefined) {
                image = req.files[0].filename;
            }
             
            userModel.firstName = req.body.firstName;
            userModel.email = req.body.email;
            userModel.phoneNumber = req.body.phoneNumber;
            userModel.accountType = req.body.accountType;
            userModel.userType = req.body.userType;
            

            if (req.files[0]!== undefined) {
                userModel.profileImage = image;
            }
            userModel.save();
            let responce = {
                id: userModel._id
            }
            
            let result = makeApiResponce('Successfully', 1, OK, responce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },


    async listofTransactions(req, res) {
        const currentUserId = req.currentUser._id;
        try{
            const getTransactions = await OrderModel.aggregate(
                    [
                        {
                        $match: {orderAccepted: { $ne: null }, requestStatus:'Accepted' }
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
                                    {
                                        $match: {user: currentUserId}
                                    },
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

            if(!getTransactions){
                let result = makeApiResponce('Empty list of Active Projects', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let result = makeApiResponce('List of Transactions', 1, OK, getTransactions);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },


    async listOfContractors(req, res){

        // console.log(req.currentUser.company);
        // return ;


        try{
            let listOfContractors  = await UserModel.aggregate(
                [
                    {
                        $match: {company:req.currentUser.company, accountType : 'standard_contractor',delBit:false}
                    },
                    // {
                    //     $lookup: {
                    //         from: "orderdetails",
                    //         localField: "_id",
                    //         foreignField: "order",
                    //         as: "orderdetails",
                    //         pipeline: [
                    //             {
                    //                 $lookup: {
                    //                     from: "properties",
                    //                     localField: "property",
                    //                     foreignField: "_id",
                    //                     as: "property"
                    //                 },
                    //             },
                    //             // { $unwind: "$property" }, mondatroy
                    //             { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
                    //             {
                    //                 $lookup: {
                    //                     from: "services",
                    //                     localField: "service",
                    //                     foreignField: "_id",
                    //                     as: "service"
                    //                 },
                    //             },
                    //             { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
                    //
                    //             // {
                    //             //     $unwind: "$property" if mandatory
                    //             // }
                    //         ],
                    //     }
                    // },
                    {
                        $sort: { createdAt: -1 }
                    }

                ]
            );


            if(!listOfContractors){
                let result = makeApiResponce('Empty list of Contractors', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let result = makeApiResponce('Listing of Contractors', 1, OK, listOfContractors);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    }
};


function getFileNameArrByItem(fiels,num){
    let arr=[];
   fiels.forEach((file, index) => {
       if(file.fieldname ==='images'+num){
         arr.push(file.filename)
       }
   })
   return arr;
}