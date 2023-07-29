import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import bcryptjs from 'bcryptjs';
import userService from "../../services/user.service.js";
import UserModel from "../../models/user.model";
import { getJWTToken, randomValueHex, getEncryptedPassword } from '../../libraries/util';
import { makeApiResponce } from '../../libraries/responce';
import { sendEmail } from "../../libraries/mail";

export default {

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
                let result = makeApiResponce('Please check your email and password', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const matched = await bcryptjs.compare(req.body.password, user.password)
            if(!matched){
                let result = makeApiResponce('Please check your email and password', 1, BAD_REQUEST)
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

async getLoginUserProfile(req, res){
    return res.json(req.currentUser);
},

async passwordReset(req, res) {
    try {            
        
    const findUser = await UserModel.findOne({ email: req.body.email });
        if (!findUser) {
            let result = makeApiResponce('Please double-check the email you entered is correct.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }

        // UPDATE THE USER
        const hash = await getEncryptedPassword(req.body.newPassword);
        findUser.password = hash;
        await findUser.save();

        let userResponce = {};

        let result = makeApiResponce('Password Update Successfully', 1, OK, userResponce);
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
            let result = makeApiResponce('Please double-check the email you entered is correct.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }

        // UPDATE THE USER
        const hash = await getEncryptedPassword(randomForgotOTP);
        findUser.password = hash;
        findUser.otp = randomForgotOTP;
        await findUser.save();

        const passwordLink = `
        <p>${findUser.firstName},</p>
        <p>A request has been received to change the password for your Reli account.</p>
        <p>Here is your verification code to reset your password: <span style="font-weight:bold">${randomForgotOTP}</span></p>
        <p><a href="http://34.236.149.254/confirm-password">Click here to reset your password and login.</a></p>`;
        // node mailer
            const mailResponce = await sendEmail({
                html: passwordLink,
                subject: `${findUser.firstName}, your requested password update`,
                email: req.body.email,
            });
        
        let userResponce = {};
        let result = makeApiResponce('Check your email for instructions on resetting your password', 1, OK, userResponce);
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
            let result = makeApiResponce('Invalid otp', 1, BAD_REQUEST)
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

async approve(req, res) {
    try{
        // FETCH THE USER
        if(!req.body.email ){
            let result = makeApiResponce('Email Required', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        const userQuery = { email: req.body.email };
        let user =  await UserModel.findOne(userQuery);
        if(!user){
            let result = makeApiResponce('Invalid Email', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }

        user.isApproved = true;
        await user.save();

        let userResponce;
            userResponce = {
                userData : user
            }
        let result = makeApiResponce('Account Approved Successfully', 1, OK, userResponce);
        return res.json(result);

    }catch(err){
        console.log(err);
        let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
        return res.status(INTERNAL_SERVER_ERROR).json(result)
    }
},


/////////// user crud /////////////////

async listing(req, res) {
    try {
        await  UserModel.find({"userType": "admin"}, function(err, users) {
            if (err) {
                let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                return res.status(INTERNAL_SERVER_ERROR).json(result)
            } else {
                let userRecord = [];
                users.forEach((doc) => {
                    userRecord.push({
                        id: doc._id,
                        firstName: doc.firstName,
                        lastName: doc.lastName,
                        email: doc.email,
                        userType: doc.userType,
                        statusBit: doc.statusBit,
                        updatedAt: doc.updatedAt
                    });
                });
                let couponResponce = userRecord;
                let result = makeApiResponce('User Listing', 1, OK, couponResponce);
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

        const randomOtp = await randomValueHex("6");

        // VALIDATE THE REQUEST
        // const {error, value} = userService.validateAddUserSchema(req.body);
        // if(error && error.details){
        //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        //     return res.status(BAD_REQUEST).json(result);
        // }

        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            let result = makeApiResponce('Email already exists', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        const user = new UserModel();

        user.email = req.body.email;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.userType = req.body.userType;
        user.statusBit = req.body.statusBit;
        user.otp = randomOtp;
        const hash = await getEncryptedPassword('12345678');
        user.password = hash;
        await user.save();
        let userResponce = {
            id: user._id
        }

        let result = makeApiResponce('User Created Successfully', 1, OK, userResponce);
        return res.json(result);

    }catch(err){
        console.log(err);
        let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
        return res.status(INTERNAL_SERVER_ERROR).json(result)
    }
},


async update(req, res) {
    try {

        const findUser = await UserModel.findById(req.params.id);
        if (!findUser) {
            let result = makeApiResponce('Coupon not found.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }

        // VALIDATE THE REQUEST
        // const {error, value} = userService.validateUpdateUserSchema(req.body);
        // if(error && error.details){
        //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
        //     return res.status(BAD_REQUEST).json(result);
        // }
        
        findUser.firstName = req.body.firstName;
        findUser.lastName = req.body.lastName;
        findUser.userType = req.body.userType;
        findUser.statusBit = req.body.statusBit;
        await findUser.save();

        let userResponce = {
            id: findUser._id
        }

        let result = makeApiResponce('User updated successfully', 1, OK, userResponce);
        return res.json(result);

    }catch(err){
        console.log(err);
        let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
        return res.status(INTERNAL_SERVER_ERROR).json(result)
    }
},

async detail(req, res) {
    try {

        const findUser = await UserModel.findById(req.params.id);
        if (!findUser) {
            let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }
        let userResponce = {
            id: findUser._id,
            firstName: findUser.firstName,
            lastName: findUser.lastName,
            email: findUser.email,
            userType: findUser.userType,
            statusBit: findUser.statusBit
        }
        let result = makeApiResponce('User Detail', 1, OK, userResponce);
        return res.json(result);

    }catch(err){
        console.log(err);
        let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
        return res.status(INTERNAL_SERVER_ERROR).json(result)
    }
},

async delete(req, res) {
    try {
        const findUser = await UserModel.findById(req.params.id);
        if (!findUser) {
            let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }

        const deleteUser = await UserModel.deleteOne({ _id: req.params.id });
        if (!deleteUser) {

            let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }

        let userResponce = {};
        let result = makeApiResponce('User Delete Successfully', 1, OK, userResponce);
        return res.json(result);

    }catch(err){
        console.log(err);
        let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
        return res.status(INTERNAL_SERVER_ERROR).json(result)
    }
},

};