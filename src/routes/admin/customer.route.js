import express from 'express';
import customerController from '../../controllers/admin/customer.controller';
import passport from 'passport';
import upload from "../../libraries/multer";

export const customerRouter =  express.Router();
customerRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.listing);
customerRouter.post('/update/:id', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.update);
customerRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.detail);
customerRouter.post('/status/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.status);
customerRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.delete);


