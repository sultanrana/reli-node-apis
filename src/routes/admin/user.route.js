import express from 'express';
import userController from '../../controllers/admin/user.controller';
import passport from 'passport'; 

export const userRouter =  express.Router();

userRouter.post('/login', userController.login);
userRouter.post('/approve', userController.approve);
userRouter.post('/forgotPassword', userController.forgotPassword);
userRouter.post('/passwordReset',  userController.passwordReset);
userRouter.post('/verifyOTP', userController.verifyOTP);
userRouter.get('/getLoginUserProfile', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.getLoginUserProfile);

userRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.listing);
userRouter.post('/add', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.add);
userRouter.post('/update/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.update);
userRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.detail);
userRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.delete);


