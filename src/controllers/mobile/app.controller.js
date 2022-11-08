import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import bcryptjs from 'bcryptjs';
import userService from "../../services/user.service.js";
import UserModel from "../../models/user.model";
import { getJWTToken, randomValueHex, getEncryptedPassword } from '../../libraries/util';
import { makeApiResponce } from '../../libraries/responce';
import { sendEmail } from "../../libraries/mail";

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
                    let result = makeApiResponce('Invalid Email and Passowrd', 1, BAD_REQUEST)
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
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
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
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
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
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
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
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
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

    async resendVerifyOTP(req, res) {
        try {

            const randomResendOTP = await randomValueHex("6");
            const findUser = await UserModel.findOne({email: req.body.email });
            if (!findUser) {
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
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
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
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
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
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
};