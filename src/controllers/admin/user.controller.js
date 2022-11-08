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

async getLoginUserProfile(req, res){
    return res.json(req.currentUser);
},

async passwordReset(req, res) {
    try {            
        
    const findUser = await UserModel.findOne({ email: req.body.email });
        if (!findUser) {
            let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
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
            let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
            return res.status(BAD_REQUEST).json(result);
        }

        // UPDATE THE USER
        const hash = await getEncryptedPassword(randomForgotOTP);
        findUser.password = hash;
        findUser.otp = randomForgotOTP;
        await findUser.save();

        const passwordLink = `
        <p>Here is your new password <span style="font-weight:bold">${randomForgotOTP}</span> login with and then change your password</a></p>
        <p><a href="http://localhost:3000/confirm-password">Enter the reset password code here</a></p>`;
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


};