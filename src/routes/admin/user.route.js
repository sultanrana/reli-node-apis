import express from 'express';
import userController from '../../controllers/admin/user.controller';
import passport from 'passport'; 
import upload from '../../libraries/multer';

export const userRouter =  express.Router();

userRouter.post('/signup', upload.any(), userController.signup);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);
userRouter.post('/test', passport.authenticate('jwt', {session: false, failureRedirect: '/failure'}),  userController.test);
userRouter.get('/getData', userController.getData);
userRouter.post('/deleteEmails', userController.clearGmail);


userRouter.post('/testFunction', userController.testFunction);