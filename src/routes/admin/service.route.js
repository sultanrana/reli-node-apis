import express from 'express';
import serviceController from '../../controllers/admin/service.controller';
import passport from 'passport';
import upload from "../../libraries/multer";


export const serviceRouter =  express.Router();
serviceRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), serviceController.listing);
serviceRouter.post('/add', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), serviceController.add);
serviceRouter.post('/update/:id',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), serviceController.update);
serviceRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), serviceController.detail);
serviceRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), serviceController.delete);