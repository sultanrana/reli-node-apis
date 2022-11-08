import express from 'express';
import userController from '../../controllers/admin/user.controller';
import passport from 'passport'; 

export const userRouter =  express.Router();

userRouter.post('/login', userController.login);
userRouter.post('/forgotPassword', userController.forgotPassword);
userRouter.post('/passwordReset',  userController.passwordReset);
userRouter.post('/verifyOTP', userController.verifyOTP);
userRouter.get('/getLoginUserProfile', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.getLoginUserProfile);


