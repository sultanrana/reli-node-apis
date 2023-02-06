import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
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
// Setup Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
export default {
    
    async signup(req, res) {
        try {
            
            // const randomOtp = await randomValueHex("6");
        
            // VALIDATE THE REQUEST
            const {error, value} = userService.validateSignupSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

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
            // user.otp = randomOtp;
            user.location = { type: 'Point', coordinates: [req.body.lat, req.body.lng] };
            const hash = await getEncryptedPassword(req.body.password);
            user.password = hash;
            await user.save();
            let userResponce = {
                email: user.email,
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
                const {error, value} = userService.validateLoginSchema(req.body);
                if(error && error.details){
                    let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                    return res.status(BAD_REQUEST).json(result);
                }
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
            <p>Here is your new password <span style="font-weight:bold">${randomForgotOTP}</span> login with and then change your password</a></p>`;
            // node mailer
                const mailResponce = await sendEmail({
                    html: passwordLink,
                    subject: "Forgot Password",
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

    async placeOrder(req, res) {
        let data = req.body.arrayData;
     //let files = req.files;

    let stripeCardToken = req.body.stripeCardToken;

    //  const token = await stripe.tokens.create({
    //      card: {
    //          number: '4242424242424242',
    //          exp_month: 2,
    //          exp_year: 2023,
    //          cvc: '314',
    //      }
    //  });
    //  console.log(token);
    //  return ;



     try {

         const getCardDetailByStripeCardtoken = await stripe.tokens.retrieve(
             stripeCardToken
         );
         const stripeCharge = await stripe.charges.create({
             amount: req.body.totalAmount,
             currency: 'usd',
             source: getCardDetailByStripeCardtoken.id,
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
     newOrderModel.save(function (err) {});





     for(var i = 0; i < data.length; i++) {

         let arr = await getFileNameArrByItem(req.files,i);
         //console.log(arr)

          var newOrderDetailModel = new OrderDetailModel();
         newOrderDetailModel.order = newOrderModel._id;
         newOrderDetailModel.serviceId = data[i].serviceId;
         newOrderDetailModel.serviceName = data[i].serviceName;
         newOrderDetailModel.serviceType = data[i].serviceType;
         newOrderDetailModel.propertyId = data[i].propertyId;
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
         newOrderDetailModel.dateSelection = data[i].dateSelection;
         newOrderDetailModel.totalAmount = data[i].totalAmount;
         newOrderDetailModel.save(function (err) {});
     }

         let orderResponce = {
             id: newOrderModel._id
         }
         let result = makeApiResponce('Order Created Successfully', 1, OK, orderResponce);
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
            let getOrder =  await OrderModel.find({user : req.currentUser});
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
            let getCompletedStatusOrders =  await OrderModel.find({user : req.currentUser,orderStatus:'Completed'});
            let getNotCompletedStatusOrders =  await OrderModel.find({user : req.currentUser,orderStatus: { "$ne": 'Completed' }});

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
            const orderDetailInfo =  await OrderDetailModel.find({order : req.params.id}).populate('propertyId');
            if(!orderModel){
                let result = makeApiResponce('Empty Order Detail', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let orderDetail=[{
                'orderInfo': orderModel,
                'orderDetailInfo': orderDetailInfo,
                }]
            let result = makeApiResponce('Order Detail', 1, OK, orderDetail);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

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