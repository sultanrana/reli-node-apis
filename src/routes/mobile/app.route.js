import express from 'express';
import appController from '../../controllers/mobile/app.controller';
import passport from 'passport'; 
import upload from "../../libraries/multer";

export const appRouter =  express.Router();

appRouter.post('/login', appController.login);
appRouter.post('/signup', appController.signup);
appRouter.post('/checkEmail', appController.checkEmail);
appRouter.post('/verifyOTP', appController.verifyOTP);
appRouter.post('/resendVerifyOTP', appController.resendVerifyOTP);
appRouter.post('/forgotPassword', appController.forgotPassword);
appRouter.post('/contactUs', appController.contactUs);
appRouter.post('/logout', appController.logout);
appRouter.get('/getLoginUserProfile', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.getLoginUserProfile);
appRouter.put('/changePassword/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.changePassword);
appRouter.put('/updatePhoneNumber/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.updatePhoneNumber);
appRouter.put('/updateAccountDetail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.updateAccountDetail);
appRouter.put('/updateLocation/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.updateLocation);
appRouter.delete('/deleteAccount/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.deleteAccount);
appRouter.get('/getAllServices', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.getAllServices);
appRouter.get('/createCart', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.createCart);

appRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listing);
appRouter.post('/add', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.add);
appRouter.post('/update/:id',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.update);
appRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.detail);
appRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.delete);

//Customer Side Apis
appRouter.post('/placeOrder', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.placeOrder);
appRouter.get('/dashboard', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.dashboard);
appRouter.get('/listOfProjects', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfProjects);
appRouter.get('/orderDetail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.orderDetail);



