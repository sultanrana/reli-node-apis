import express from 'express';
import transactionController from '../../controllers/admin/transaction.controller';
import passport from 'passport';
import upload from "../../libraries/multer";

export const transactionRouter =  express.Router();
transactionRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), transactionController.listing);
transactionRouter.post('/refund-transaction', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), transactionController.refundTransaction);
//projectRouter.post('/update/:id', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.update);
//projectRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.detail);
//projectRouter.post('/status/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.status);
//projectRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.delete);


