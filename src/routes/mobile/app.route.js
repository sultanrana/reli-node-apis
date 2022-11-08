import express from 'express';
import appController from '../../controllers/mobile/app.controller';
import passport from 'passport'; 

export const appRouter =  express.Router();

appRouter.post('/login', appController.login);
appRouter.post('/signup', appController.signup);
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

